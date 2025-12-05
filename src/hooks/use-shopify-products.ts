"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { shopifyProductKeys } from "@/lib/query-client";
import { getShopifyProducts } from "@/services/shopify.service";
import type { ShopifyApiError } from "@/services/shopify.service";
import type {
  ListProductsParams,
  ProductImportInfo,
  ProductPagination,
} from "@/types/shopify.types";

/**
 * Options for the useShopifyProducts hook.
 */
interface UseShopifyProductsOptions {
  /** Query parameters for filtering/pagination. */
  params?: ListProductsParams;
  /** Whether the query is enabled. */
  enabled?: boolean;
}

/**
 * Return type for the useShopifyProducts hook.
 */
interface UseShopifyProductsResult {
  /** List of products. */
  products: ProductImportInfo[];
  /** Whether the query is loading initially. */
  isLoading: boolean;
  /** Whether the query is fetching (includes background refetches). */
  isFetching: boolean;
  /** Whether an error occurred. */
  isError: boolean;
  /** Error object if an error occurred. */
  error: ShopifyApiError | null;
  /** Refetch function to manually trigger a refetch. */
  refetch: () => void;
  /** Pagination information. */
  pagination: ProductPagination | null;
  /** Total count of products in the current response. */
  totalCount: number;
}

/**
 * Hook to fetch and cache Shopify products with pagination support.
 *
 * @param options - Hook options including query parameters and enabled flag.
 * @returns Query result with products data, loading state, and pagination.
 */
export function useShopifyProducts(
  options?: UseShopifyProductsOptions,
): UseShopifyProductsResult {
  const { params, enabled = true } = options ?? {};

  const query = useQuery({
    queryKey: shopifyProductKeys.list(params),
    queryFn: () => getShopifyProducts(params),
    enabled,
    staleTime: 30 * 1000, // 30 seconds.
    // Retry with longer delay for rate limit errors.
    retry: (failureCount, error) => {
      const shopifyError = error as ShopifyApiError;
      // Don't retry rate limit errors immediately.
      if (shopifyError.isRateLimited) {
        return failureCount < 2;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex, error) => {
      const shopifyError = error as ShopifyApiError;
      // Wait longer for rate limit errors.
      if (shopifyError.isRateLimited) {
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      }
      return Math.min(1000 * 2 ** attemptIndex, 10000);
    },
  });

  return {
    products: query.data?.data?.products ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error as ShopifyApiError | null,
    refetch: () => {
      query.refetch();
    },
    pagination: query.data?.data?.pagination ?? null,
    totalCount: query.data?.data?.totalCount ?? 0,
  };
}

/**
 * Hook to prefetch Shopify products for a specific set of parameters.
 *
 * Useful for prefetching the next page of results.
 *
 * @returns Prefetch function.
 */
export function usePrefetchShopifyProducts() {
  const queryClient = useQueryClient();

  return (params?: ListProductsParams) => {
    return queryClient.prefetchQuery({
      queryKey: shopifyProductKeys.list(params),
      queryFn: () => getShopifyProducts(params),
      staleTime: 30 * 1000,
    });
  };
}
