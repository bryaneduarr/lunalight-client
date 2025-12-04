"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { themeKeys } from "@/lib/query-client";
import { getThemes } from "@/services/themes.service";
import type { ListThemesParams, Theme } from "@/types/themes.types";
import type { ApiError } from "@/services/themes.service";

/**
 * Options for the useThemes hook.
 */
interface UseThemesOptions {
  /** Query parameters for filtering/pagination. */
  params?: ListThemesParams;
  /** Whether the query is enabled. */
  enabled?: boolean;
}

/**
 * Return type for the useThemes hook.
 */
interface UseThemesResult {
  /** List of themes. */
  themes: Theme[];
  /** Whether the query is loading. */
  isLoading: boolean;
  /** Whether the query is fetching (includes background refetches). */
  isFetching: boolean;
  /** Whether an error occurred. */
  isError: boolean;
  /** Error object if an error occurred. */
  error: ApiError | null;
  /** Refetch function to manually trigger a refetch. */
  refetch: () => void;
  /** Pagination metadata. */
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
}

/**
 * Hook to fetch and cache a list of themes with pagination support.
 *
 * @param options - Hook options including query parameters and enabled flag.
 * @returns Query result with themes data, loading state, and pagination.
 *
 * @example
 * ```tsx
 * function ThemesList() {
 *   const { themes, isLoading, pagination } = useThemes({
 *     params: { status: 'published', page: 1 }
 *   });
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return (
 *     <ul>
 *       {themes.map(theme => (
 *         <li key={theme.id}>{theme.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useThemes(options?: UseThemesOptions): UseThemesResult {
  const { params, enabled = true } = options ?? {};

  const query = useQuery({
    queryKey: themeKeys.list(params),
    queryFn: () => getThemes(params),
    enabled,
    staleTime: 30 * 1000, // 30 seconds.
  });

  return {
    themes: query.data?.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error as ApiError | null,
    refetch: () => {
      query.refetch();
    },
    pagination: query.data?.pagination ?? null,
  };
}

/**
 * Hook to prefetch themes for a specific set of parameters.
 *
 * Useful for prefetching the next page of results or anticipated queries.
 *
 * @returns Prefetch function.
 */
export function usePrefetchThemes() {
  const queryClient = useQueryClient();

  return (params?: ListThemesParams) => {
    return queryClient.prefetchQuery({
      queryKey: themeKeys.list(params),
      queryFn: () => getThemes(params),
      staleTime: 30 * 1000,
    });
  };
}
