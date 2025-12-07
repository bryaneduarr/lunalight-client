import env from "@/env";

/** Base API URL from validated environment variables. */
const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

/** Cookie names for tokens (readable by proxy.ts). */
const ACCESS_TOKEN_COOKIE = "lunalight_access_token";
const REFRESH_TOKEN_COOKIE = "lunalight_refresh_token";

/**
 * Auth tokens stored in memory for API requests.
 */
interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
  shopDomain: string | null;
}

/** In-memory token storage. */
let tokens: AuthTokens = {
  accessToken: null,
  refreshToken: null,
  shopDomain: null,
};

/** Listeners for token changes. */
const tokenChangeListeners: Set<(tokens: AuthTokens) => void> = new Set();

/** Flag to prevent concurrent refresh attempts. */
let isRefreshing = false;

/** Queue of pending requests waiting for token refresh. */
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

/**
 * Response from the refresh token endpoint.
 */
interface RefreshTokenResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: string;
    refreshTokenExpiresAt: string;
    shopDomain: string;
  };
  error?: {
    type: string;
    message: string;
  };
}

/**
 * JWT payload structure for decoding shop domain.
 */
interface JwtPayload {
  shopDomain?: string;
}

/**
 * Decodes a JWT token to extract payload without verification.
 * This is safe for client-side since we only need to read the shop domain.
 *
 * @param token - The JWT token to decode.
 * @returns The decoded payload or null if invalid.
 */
function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];
    if (!payload) {
      return null;
    }
    // Base64url decode.
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}



/**
 * Gets a cookie value by name.
 *
 * @param name - Cookie name.
 * @returns Cookie value or null if not found.
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Token service for managing authentication tokens.
 *
 * Handles token storage, refresh, and synchronization across tabs.
 * Stores tokens both in memory (for API requests) and cookies (for proxy.ts).
 * Shop domain is stored in memory only, not in cookies.
 */
export const tokenService = {
  /**
   * Sets the authentication tokens and shop domain in memory.
   * Cookies are managed by the server via HTTP-only cookies.
   * This only updates the in-memory state for API requests.
   *
   * @param accessToken - The JWT access token.
   * @param refreshToken - The JWT refresh token.
   * @param shopDomain - The shop domain (optional).
   */
  setTokens(
    accessToken: string | null,
    refreshToken: string | null,
    shopDomain?: string | null,
  ): void {
    tokens = { accessToken, refreshToken, shopDomain: shopDomain ?? null };
    this.notifyListeners();
  },

  /**
   * Gets the current access token.
   *
   * @returns The access token or null if not set.
   */
  getAccessToken(): string | null {
    return tokens.accessToken;
  },

  /**
   * Gets the current refresh token.
   *
   * @returns The refresh token or null if not set.
   */
  getRefreshToken(): string | null {
    return tokens.refreshToken;
  },

  /**
   * Gets the current shop domain.
   *
   * @returns The shop domain or null if not set.
   */
  getShopDomain(): string | null {
    return tokens.shopDomain;
  },

  /**
   * Checks if there are valid tokens stored for authenticated state.
   * Valid means access token exists - this is the source of truth for authentication.
   * Refresh token alone does NOT mean authenticated.
   *
   * @returns True if access token is present.
   */
  hasTokens(): boolean {
    return tokens.accessToken !== null;
  },

  /**
   * Checks if there is a refresh token available for token refresh.
   *
   * @returns True if refresh token is present.
   */
  hasRefreshToken(): boolean {
    return tokens.refreshToken !== null;
  },

  /**
   * Checks the actual cookie state and syncs with memory.
   * This is useful for detecting when cookies have expired.
   *
   * @returns Object with current cookie state.
   */
  syncFromCookies(): {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    needsRefresh: boolean;
  } {
    if (typeof document === "undefined") {
      return {
        hasAccessToken: false,
        hasRefreshToken: false,
        needsRefresh: false,
      };
    }

    const accessTokenCookie = getCookie(ACCESS_TOKEN_COOKIE);
    const refreshTokenCookie = getCookie(REFRESH_TOKEN_COOKIE);

    // Sync memory state with cookie state.
    if (accessTokenCookie !== tokens.accessToken) {
      // Access token cookie changed (likely expired).
      if (!accessTokenCookie && tokens.accessToken) {
        // Access token expired - clear from memory.
        tokens.accessToken = null;
      } else if (accessTokenCookie && !tokens.accessToken) {
        // Access token appeared (shouldn't happen normally).
        tokens.accessToken = accessTokenCookie;
      }
    }

    if (refreshTokenCookie !== tokens.refreshToken) {
      // Refresh token cookie changed.
      if (!refreshTokenCookie && tokens.refreshToken) {
        // Refresh token expired - clear from memory.
        tokens.refreshToken = null;
      } else if (refreshTokenCookie && !tokens.refreshToken) {
        // Refresh token appeared (shouldn't happen normally).
        tokens.refreshToken = refreshTokenCookie;
      }
    }

    const hasAccessToken = Boolean(accessTokenCookie);
    const hasRefreshToken = Boolean(refreshTokenCookie);
    const needsRefresh = !hasAccessToken && hasRefreshToken;

    return { hasAccessToken, hasRefreshToken, needsRefresh };
  },

  /**
   * Validates current authentication state and refreshes tokens if needed.
   *
   * @returns Promise resolving to true if authenticated, false otherwise.
   */
  async ensureAuthenticated(): Promise<boolean> {
    const { hasAccessToken, needsRefresh } = this.syncFromCookies();

    // If we have access token, we're good.
    if (hasAccessToken) {
      return true;
    }

    // If we need to refresh (no access token but have refresh token).
    if (needsRefresh) {
      try {
        await this.refreshAccessToken();
        return true;
      } catch {
        // Refresh failed - not authenticated.
        this.clearTokens();
        return false;
      }
    }

    // No tokens at all.
    return false;
  },

  /**
   * Checks if the token state is valid.
   * Invalid state: access token exists but no refresh token.
   * In this case, the session should be considered invalid.
   *
   * @returns True if token state is valid, false if invalid.
   */
  hasValidTokenState(): boolean {
    // If no tokens at all, valid state (just not authenticated).
    if (!tokens.accessToken && !tokens.refreshToken) {
      return true;
    }
    // If access token only (no refresh token) then invalid state.
    if (tokens.accessToken && !tokens.refreshToken) {
      return false;
    }
    // If refresh token exists then valid state.
    return true;
  },

  /**
   * Clears all stored tokens from memory.
   * Server-side logout endpoint handles cookie deletion.
   */
  clearTokens(): void {
    tokens = { accessToken: null, refreshToken: null, shopDomain: null };
    this.notifyListeners();
  },

  /**
   * Initializes tokens from HTTP-only cookies on page load.
   * Reads cookies set by the server to sync memory state.
   * Shop domain will be retrieved from token refresh response.
   *
   * @returns Object indicating if proactive refresh is needed.
   */
  initFromCookies(): { needsProactiveRefresh: boolean } {
    if (typeof document === "undefined") {
      return { needsProactiveRefresh: false };
    }

    const accessToken = getCookie(ACCESS_TOKEN_COOKIE);
    const refreshToken = getCookie(REFRESH_TOKEN_COOKIE);

    // Access token only, no refresh token is invalid state.
    if (accessToken && !refreshToken) {
      // Invalid state - server should handle cookie cleanup on next request.
      tokens = { accessToken: null, refreshToken: null, shopDomain: null };
      this.notifyListeners();
      return { needsProactiveRefresh: false };
    }

    // Refresh token exists (with or without access token).
    if (refreshToken) {
      // Try to extract shop domain from access token if available.
      let shopDomain: string | null = null;
      if (accessToken) {
        const payload = decodeJwtPayload(accessToken);
        shopDomain = payload?.shopDomain ?? null;
      }
      tokens = { accessToken, refreshToken, shopDomain };
      this.notifyListeners();
      // If no access token but refresh exists, need proactive refresh.
      return { needsProactiveRefresh: !accessToken };
    }

    // Case 3: No tokens at all.
    return { needsProactiveRefresh: false };
  },

  /**
   * Adds a listener for token changes.
   *
   * @param listener - Callback function when tokens change.
   * @returns Cleanup function to remove the listener.
   */
  addTokenChangeListener(listener: (tokens: AuthTokens) => void): () => void {
    tokenChangeListeners.add(listener);
    return () => tokenChangeListeners.delete(listener);
  },

  /**
   * Notifies all listeners of token changes.
   */
  notifyListeners(): void {
    for (const listener of tokenChangeListeners) {
      listener(tokens);
    }
  },

  /**
   * Refreshes the access token using the refresh token.
   *
   * Implements a queue system to prevent multiple concurrent refresh requests.
   *
   * @returns Promise resolving to the new access token.
   * @throws Error if refresh fails.
   */
  async refreshAccessToken(): Promise<string> {
    // If already refreshing, queue this request.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      });
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available.");
    }

    isRefreshing = true;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
        credentials: "include",
      });

      const data: RefreshTokenResponse = await response.json();

      if (!response.ok || !data.success || !data.data) {
        // Clear tokens on refresh failure.
        this.clearTokens();
        const error = new Error(data.error?.message ?? "Token refresh failed.");
        // Reject all queued requests.
        for (const { reject } of refreshQueue) {
          reject(error);
        }
        refreshQueue = [];
        throw error;
      }

      // Update tokens with new values and shop domain.
      this.setTokens(
        data.data.accessToken,
        data.data.refreshToken,
        data.data.shopDomain,
      );

      // Resolve all queued requests with new access token.
      for (const { resolve } of refreshQueue) {
        resolve(data.data.accessToken);
      }
      refreshQueue = [];

      return data.data.accessToken;
    } catch (error) {
      // Clear tokens on any error.
      this.clearTokens();
      // Reject all queued requests.
      const err =
        error instanceof Error ? error : new Error("Token refresh failed.");
      for (const { reject } of refreshQueue) {
        reject(err);
      }
      refreshQueue = [];
      throw err;
    } finally {
      isRefreshing = false;
    }
  },

  /**
   * Gets a valid access token, refreshing if necessary.
   *
   * @returns Promise resolving to a valid access token.
   * @throws Error if no valid token can be obtained.
   */
  async getValidAccessToken(): Promise<string> {
    const accessToken = this.getAccessToken();
    if (accessToken) {
      return accessToken;
    }

    // Try to refresh if we have a refresh token.
    if (this.getRefreshToken()) {
      return this.refreshAccessToken();
    }

    throw new Error("No authentication tokens available.");
  },
};

export default tokenService;
