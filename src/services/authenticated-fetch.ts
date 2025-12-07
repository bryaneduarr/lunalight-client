import tokenService from "@/services/token.service";

/**
 * Error response structure from the API.
 */
interface ApiErrorResponse {
  success: false;
  error: {
    type: string;
    message: string;
  };
}

/**
 * Custom error class for API errors.
 */
export class ApiError extends Error {
  /** Error type code. */
  readonly type: string;
  /** HTTP status code. */
  readonly statusCode: number;
  /** Whether the error is due to authentication. */
  readonly isAuthError: boolean;
  /** Optional field-specific error details. */
  readonly details?: Record<string, string[]>;

  constructor(
    message: string,
    type: string,
    statusCode: number,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.isAuthError =
      statusCode === 401 ||
      type === "TOKEN_EXPIRED" ||
      type === "INVALID_TOKEN" ||
      type === "NO_TOKEN";
  }
}

/**
 * Callback type for handling authentication redirects.
 */
type AuthRedirectCallback = () => void;

/** Callback to handle authentication redirects. */
let onAuthRedirect: AuthRedirectCallback | null = null;

/**
 * Sets the callback for handling authentication redirects.
 *
 * @param callback - Function to call when auth redirect is needed.
 */
export function setAuthRedirectCallback(callback: AuthRedirectCallback): void {
  onAuthRedirect = callback;
}

/**
 * Gets a valid access token for the request.
 * If no access token exists but refresh token does, proactively refreshes.
 * This ensures requests always have a valid access token.
 *
 * @returns Promise resolving to access token or null if unavailable.
 */
async function getValidAccessTokenForRequest(): Promise<string | null> {
  const accessToken = tokenService.getAccessToken();
  if (accessToken) {
    return accessToken;
  }

  // No access token, check if we can refresh using refresh token.
  const hasRefreshToken = tokenService.hasRefreshToken();
  if (hasRefreshToken) {
    try {
      // Proactively refresh to get new access token.
      return await tokenService.refreshAccessToken();
    } catch {
      // Refresh failed - return null to trigger auth redirect.
      return null;
    }
  }

  return null;
}

/**
 * Authenticated fetch wrapper with automatic token refresh.
 *
 * This function wraps the native fetch API to:
 * 1. Get a valid access token (refreshing if needed).
 * 2. Automatically inject the access token in Authorization header.
 * 3. Handle 401 responses by refreshing the token and retrying.
 * 4. Redirect to login if refresh fails.
 *
 * @param input - The fetch URL or Request object.
 * @param init - Optional fetch init options.
 * @returns Promise resolving to the Response.
 * @throws ApiError if the request fails after retry.
 */
export async function authenticatedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  // Proactively get a valid access token (will refresh if needed).
  const accessToken = await getValidAccessTokenForRequest();

  // If no access token available after refresh attempt, redirect to login.
  if (!accessToken) {
    if (onAuthRedirect) {
      onAuthRedirect();
    }
    throw new ApiError(
      "Not authenticated. Please log in.",
      "NOT_AUTHENTICATED",
      401,
    );
  }

  // Prepare headers with access token (guaranteed to exist at this point).
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);

  // Make the initial request.
  let response = await fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });

  // If unauthorized, try to refresh and retry.
  if (response.status === 401) {
    const errorData: ApiErrorResponse = await response.clone().json().catch(() => ({
      success: false,
      error: { type: "UNKNOWN", message: "Unknown error" },
    }));

    // Check if it's a token expiration error.
    if (
      errorData.error?.type === "TOKEN_EXPIRED" ||
      errorData.error?.type === "NO_TOKEN" ||
      errorData.error?.type === "INVALID_TOKEN"
    ) {
      try {
        // Try to refresh the token.
        const newAccessToken = await tokenService.refreshAccessToken();

        // Retry the request with new token.
        headers.set("Authorization", `Bearer ${newAccessToken}`);
        response = await fetch(input, {
          ...init,
          headers,
          credentials: "include",
        });
      } catch {
        // Refresh failed, redirect to login.
        if (onAuthRedirect) {
          onAuthRedirect();
        }
        throw new ApiError(
          "Session expired. Please log in again.",
          "SESSION_EXPIRED",
          401,
        );
      }
    } else {
      // Other auth error, redirect to login.
      if (onAuthRedirect) {
        onAuthRedirect();
      }
      throw new ApiError(
        errorData.error?.message ?? "Authentication failed.",
        errorData.error?.type ?? "AUTH_ERROR",
        401,
      );
    }
  }

  return response;
}

/**
 * Makes an authenticated JSON request.
 *
 * @param url - The request URL.
 * @param options - Fetch options.
 * @returns Promise resolving to the parsed JSON response.
 * @throws ApiError if the request fails.
 */
export async function authenticatedJsonFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");

  const response = await authenticatedFetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;
    throw new ApiError(
      errorData.error?.message ?? "Request failed.",
      errorData.error?.type ?? "REQUEST_FAILED",
      response.status,
    );
  }

  return data as T;
}

export default authenticatedFetch;
