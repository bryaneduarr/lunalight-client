import env from "@/env";

/** Base API URL from validated environment variables. */
const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

/**
 * Authentication response from the OAuth callback.
 */
export interface AuthCallbackResponse {
  success: boolean;
  data?: {
    shopDomain: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: string;
    refreshTokenExpiresAt: string;
    isOnline: boolean;
    scopes: string;
  };
  message?: string;
  error?: {
    type: string;
    message: string;
  };
}

/**
 * Custom error class for authentication errors.
 */
export class AuthError extends Error {
  /** Error type code. */
  readonly type: string;
  /** HTTP status code. */
  readonly statusCode: number;

  constructor(message: string, type: string, statusCode: number) {
    super(message);
    this.name = "AuthError";
    this.type = type;
    this.statusCode = statusCode;
  }
}

/**
 * Construct the OAuth begin URL for Shopify authentication.
 *
 * @param shopDomain - The shop domain ("mystore.myshopify.com").
 * @returns The full OAuth begin URL.
 */
export function getOAuthBeginUrl(shopDomain: string): string {
  const sanitizedDomain = sanitizeShopDomain(shopDomain);
  return `${API_BASE_URL}/auth?shop=${encodeURIComponent(sanitizedDomain)}`;
}

/**
 * Sanitizes and validates a Shopify shop domain.
 *
 * Ensures the domain ends with .myshopify.com and is lowercase.
 * Strips any protocol or path from the input.
 *
 * @param shop - The shop domain input from the user.
 * @returns The sanitized shop domain.
 */
export function sanitizeShopDomain(shop: string): string {
  // Remove protocol if present.
  let sanitized = shop.toLowerCase().trim();
  sanitized = sanitized.replace(/^https?:\/\//, "");

  // Remove trailing slashes and paths.
  sanitized = sanitized.split("/")[0] ?? sanitized;

  // Add .myshopify.com if not present.
  if (!sanitized.endsWith(".myshopify.com")) {
    // Check if it's just the store name without the domain.
    if (!sanitized.includes(".")) {
      sanitized = `${sanitized}.myshopify.com`;
    }
  }

  return sanitized;
}

/**
 * Validates if a shop domain is in the correct format.
 *
 * @param shop - The shop domain to validate.
 * @returns True if the domain is valid, false otherwise.
 */
export function isValidShopDomain(shop: string): boolean {
  const sanitized = sanitizeShopDomain(shop);
  // Validate format: store-name.myshopify.com.
  const regex = /^[a-z0-9-]+\.myshopify\.com$/;
  return regex.test(sanitized);
}

/**
 * Initiates the OAuth flow by redirecting to the Shopify auth page.
 *
 * @param shopDomain - The shop domain to authenticate with.
 */
export function initiateOAuth(shopDomain: string): void {
  const authUrl = getOAuthBeginUrl(shopDomain);
  // Redirect the browser to start the OAuth flow.
  window.location.href = authUrl;
}

/**
 * Logs out the user by calling the logout endpoint.
 *
 * @param shopDomain - The shop domain to log out.
 */
export async function logout(shopDomain: string): Promise<void> {
  try {
    // Call the logout endpoint to invalidate the session on the server.
    const response = await fetch(
      `${API_BASE_URL}/auth/logout?shop=${encodeURIComponent(shopDomain)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("[auth]: Logout request failed:", errorData);
    }
  } catch (error) {
    // Log the error but don't throw - auth state will be cleared anyway.
    console.error("[auth]: Error during logout request:", error);
  }
}
