"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { themeKeys } from "@/lib/query-client";
import { getTheme } from "@/services/themes.service";
import type { Theme } from "@/types/themes.types";
import type { ApiError } from "@/services/themes.service";

/**
 * Options for the useTheme hook.
 */
interface UseThemeOptions {
  /** Whether the query is enabled. */
  enabled?: boolean;
}

/**
 * Return type for the useTheme hook.
 */
interface UseThemeResult {
  /** The theme data. */
  theme: Theme | null;
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
}

/**
 * Hook to fetch and cache a single theme by ID.
 *
 * @param id - The theme ID to fetch.
 * @param options - Hook options including enabled flag.
 * @returns Query result with theme data and loading state.
 */
export function useTheme(
  id: number,
  options?: UseThemeOptions,
): UseThemeResult {
  const { enabled = true } = options ?? {};

  const query = useQuery({
    queryKey: themeKeys.detail(id),
    queryFn: () => getTheme(id),
    enabled: enabled && id > 0,
  });

  return {
    theme: query.data?.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error as ApiError | null,
    refetch: () => {
      query.refetch();
    },
  };
}

/**
 * Hook to prefetch a theme by ID.
 *
 * Useful for prefetching theme data before navigation.
 *
 * @returns Prefetch function.
 */
export function usePrefetchTheme() {
  const queryClient = useQueryClient();

  return (id: number) => {
    return queryClient.prefetchQuery({
      queryKey: themeKeys.detail(id),
      queryFn: () => getTheme(id),
    });
  };
}
