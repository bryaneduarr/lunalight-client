import env from "@/env";

/** Base API URL from validated environment variables. */
const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

/** Cookie names are no longer used - HTTP-only cookies cannot be read by JavaScript. */

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
 * JWT decoding is no longer needed - server provides auth status.
 */
/**
 * Note: HTTP-only cookies cannot be read by JavaScript.
 * We use server-side auth status endpoint instead.
 */

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
   * Checks the actual auth state by asking the server.
   * HTTP-only cookies cannot be read by JavaScript.
   * Notifies listeners when token state changes.
   *
   * @returns Object with current auth state.
   */
  async syncFromServer(): Promise<{
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    needsRefresh: boolean;
  }> {
    try {
      // Check auth status with server.
      const response = await fetch(`${API_BASE_URL}/auth/status`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        return {
          hasAccessToken: false,
          hasRefreshToken: false,
          needsRefresh: false,
        };
      }

      const data = await response.json();

      if (data.success && data.data.isAuthenticated) {
        // User has valid access token.
        return {
          hasAccessToken: true,
          hasRefreshToken: true,
          needsRefresh: false,
        };
      }

      // Not authenticated, but check if refresh token exists by attempting refresh.
      // We can't read HTTP-only cookies, so we try to refresh.
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.success) {
            // Refresh token exists and is valid.
            // Update memory state.
            this.setTokens(
              refreshData.data.accessToken,
              refreshData.data.refreshToken,
              refreshData.data.shopDomain,
            );
            return {
              hasAccessToken: true,
              hasRefreshToken: true,
              needsRefresh: false,
            };
          }
        }
      } catch {
        // Refresh failed, no refresh token.
      }

      // No tokens at all.
      return {
        hasAccessToken: false,
        hasRefreshToken: false,
        needsRefresh: false,
      };
    } catch {
      return {
        hasAccessToken: false,
        hasRefreshToken: false,
        needsRefresh: false,
      };
    }
  },

  /**
   * Validates current authentication state by checking with server.
   *
   * @returns Promise resolving to true if authenticated, false otherwise.
   */
  async ensureAuthenticated(): Promise<boolean> {
    const { hasAccessToken } = await this.syncFromServer();
    return hasAccessToken;
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
   * Initializes auth state by checking with the server.
   * HTTP-only cookies cannot be read by JavaScript, so we ask the server.
   *
   * @returns Object indicating if tokens exist and if refresh is needed.
   */
  async initFromServer(): Promise<{
    hasAccessToken: boolean;
    needsProactiveRefresh: boolean;
    shopDomain: string | null;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/status`, {
        method: "GET",
        credentials: "include", // Include HTTP-only cookies.
      });

      if (!response.ok) {
        return {
          hasAccessToken: false,
          needsProactiveRefresh: false,
          shopDomain: null,
        };
      }

      const data = await response.json();

      if (data.success && data.data.isAuthenticated) {
        // User is authenticated - set tokens in memory.
        // We don't have the actual token values, but we know they exist in cookies.
        // Set a placeholder to indicate authenticated state.
        tokens = {
          accessToken: "HTTP_ONLY_COOKIE",
          refreshToken: "HTTP_ONLY_COOKIE",
          shopDomain: data.data.shopDomain,
        };
        this.notifyListeners();
        return {
          hasAccessToken: true,
          needsProactiveRefresh: false,
          shopDomain: data.data.shopDomain,
        };
      }

      // Not authenticated.
      tokens = { accessToken: null, refreshToken: null, shopDomain: null };
      this.notifyListeners();
      return {
        hasAccessToken: false,
        needsProactiveRefresh: false,
        shopDomain: null,
      };
    } catch (_error) {
      // Error checking auth status - assume not authenticated.
      tokens = { accessToken: null, refreshToken: null, shopDomain: null };
      this.notifyListeners();
      return {
        hasAccessToken: false,
        needsProactiveRefresh: false,
        shopDomain: null,
      };
    }
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
   * Refreshes the access token using the refresh token from HTTP-only cookie.
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

    isRefreshing = true;

    try {
      // Refresh token is in HTTP-only cookie, no need to send in body.
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Include HTTP-only cookies.
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
