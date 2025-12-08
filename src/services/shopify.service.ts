import type {
  ListProductsParams,
  ListProductsResponse,
} from "@/types/shopify.types";
import {
  authenticatedJsonFetch,
  ApiError,
} from "@/services/authenticated-fetch";
import env from "@/env";

/** Base API URL from validated environment variables. */
const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

/**
 * Custom error class for Shopify API errors.
 * Extends the base ApiError with rate limiting detection.
 */
export class ShopifyApiError extends ApiError {
  /** Whether this is a rate limit error. */
  readonly isRateLimited: boolean;

  constructor(
    message: string,
    type: string,
    statusCode: number,
    details?: Record<string, string[]>,
  ) {
    super(message, type, statusCode, details);
    this.name = "ShopifyApiError";
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
 * Fetches a paginated list of products from the user's Shopify store.
 * Uses authenticatedFetch for automatic token management and refresh.
 *
 * @param params - Optional query parameters for filtering/pagination.
 * @returns Paginated products response.
 * @throws ApiError if the request fails.
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

  return authenticatedJsonFetch<ListProductsResponse>(url);
}
