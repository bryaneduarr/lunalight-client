"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { themeKeys } from "@/lib/query-client";
import { createTheme } from "@/services/themes.service";
import type { CreateThemeInput, Theme } from "@/types/themes.types";
import type { ApiError } from "@/services/themes.service";

/**
 * Options for the useCreateTheme mutation hook.
 */
interface UseCreateThemeOptions {
  /** Callback invoked when the mutation succeeds. */
  onSuccess?: (theme: Theme) => void;
  /** Callback invoked when the mutation fails. */
  onError?: (error: ApiError) => void;
  /** Callback invoked when the mutation settles (success or error). */
  onSettled?: () => void;
}

/**
 * Return type for the useCreateTheme hook.
 */
interface UseCreateThemeResult {
  /** Function to create a new theme. */
  createTheme: (input: CreateThemeInput) => void;
  /** Async function to create a new theme and return the result. */
  createThemeAsync: (input: CreateThemeInput) => Promise<Theme>;
  /** Whether the mutation is currently pending. */
  isPending: boolean;
  /** Whether the mutation succeeded. */
  isSuccess: boolean;
  /** Whether the mutation failed. */
  isError: boolean;
  /** Error object if the mutation failed. */
  error: ApiError | null;
  /** The created theme data if successful. */
  data: Theme | null;
  /** Reset the mutation state. */
  reset: () => void;
}

/**
 * Hook to create a new theme with optimistic updates and cache invalidation.
 *
 * @param options - Mutation options including callbacks.
 * @returns Mutation result with create function and status.
 */
export function useCreateTheme(
  options?: UseCreateThemeOptions,
): UseCreateThemeResult {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled } = options ?? {};

  const mutation = useMutation({
    mutationFn: async (input: CreateThemeInput) => {
      const response = await createTheme(input);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch themes list after successful creation.
      queryClient.invalidateQueries({ queryKey: themeKeys.lists() });
      onSuccess?.(data);
    },
    onError: (error: ApiError) => {
      onError?.(error);
    },
    onSettled: () => {
      onSettled?.();
    },
  });

  return {
    createTheme: (input) => mutation.mutate(input),
    createThemeAsync: async (input) => mutation.mutateAsync(input),
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error as ApiError | null,
    data: mutation.data ?? null,
    reset: mutation.reset,
  };
}
