import type {
  ListProductsParams,
  ListProductsResponse,
  ProductsApiErrorResponse,
} from "@/types/shopify.types";
import env from "@/env";

/** Base API URL from validated environment variables. */
const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

/** Session token for authenticated API requests. */
let sessionToken: string | null = null;

/**
 * Sets the session token for authenticated API requests.
 * Call this function after successful authentication to inject the token.
 *
 * @param token - The session token to use for API requests, or null to clear.
 */
export function setSessionToken(token: string | null): void {
  sessionToken = token;
}

/**
 * Gets the current session token.
 *
 * @returns The current session token or null if not set.
 */
export function getSessionToken(): string | null {
  return sessionToken;
}

/**
 * Custom error class for Shopify API errors.
 */
export class ShopifyApiError extends Error {
  /** Error type code. */
  readonly type: string;
  /** HTTP status code. */
  readonly statusCode: number;
  /** Additional error details. */
  readonly details?: Record<string, string[]>;
  /** Whether this is a rate limit error. */
  readonly isRateLimited: boolean;

  constructor(
    message: string,
    type: string,
    statusCode: number,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ShopifyApiError";
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.isRateLimited = statusCode === 429;
  }
}

/**
 * Builds URL search params from an object, filtering out undefined values.
 *
 * @param params - Object with query parameters.
 * @returns URLSearchParams instance.
 */
function buildSearchParams(
  params: Record<string, string | number | undefined>,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  }
  return searchParams;
}

/**
 * Handles API response and throws ShopifyApiError if request failed.
 *
 * @param response - Fetch response object.
 * @returns Parsed JSON response.
 * @throws ShopifyApiError if the response indicates failure.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const json = await response.json();

  if (!response.ok || json.success === false) {
    const errorResponse = json as ProductsApiErrorResponse;

    throw new ShopifyApiError(
      errorResponse.error?.message ?? "An unknown error occurred.",
      errorResponse.error?.type ?? "UNKNOWN_ERROR",
      response.status,
      errorResponse.error?.details,
    );
  }

  return json as T;
}

/**
 * Gets the default headers for API requests.
 * Includes the session token in the Authorization header when available.
 *
 * @returns Headers object with content type and authorization.
 */
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Inject session token when available for authenticated requests.
  if (sessionToken) {
    headers.Authorization = `Bearer ${sessionToken}`;
  }

  return headers;
}

/**
 * Fetches a paginated list of products from the user's Shopify store.
 *
 * @param params - Optional query parameters for filtering/pagination.
 * @returns Paginated products response.
 * @throws ShopifyApiError if the request fails.
 */
export async function getShopifyProducts(
  params?: ListProductsParams,
): Promise<ListProductsResponse> {
  const searchParams = buildSearchParams({
    limit: params?.limit,
    pageInfo: params?.pageInfo,
    status: params?.status,
    productType: params?.productType,
    vendor: params?.vendor,
  });

  const url = `${API_BASE_URL}/shopify/products${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  });

  return handleResponse<ListProductsResponse>(response);
}
