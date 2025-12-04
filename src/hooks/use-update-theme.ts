"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { themeKeys } from "@/lib/query-client";
import { updateTheme } from "@/services/themes.service";
import type { UpdateThemeInput, Theme } from "@/types/themes.types";
import type { ApiError } from "@/services/themes.service";

/**
 * Options for the useUpdateTheme mutation hook.
 */
interface UseUpdateThemeOptions {
  /** Callback invoked when the mutation succeeds. */
  onSuccess?: (theme: Theme) => void;
  /** Callback invoked when the mutation fails. */
  onError?: (error: ApiError) => void;
  /** Callback invoked when the mutation settles (success or error). */
  onSettled?: () => void;
}

/**
 * Variables for the update mutation.
 */
interface UpdateThemeVariables {
  /** Theme ID to update. */
  id: number;
  /** Update data. */
  input: UpdateThemeInput;
}

/**
 * Return type for the useUpdateTheme hook.
 */
interface UseUpdateThemeResult {
  /** Function to update a theme. */
  updateTheme: (variables: UpdateThemeVariables) => void;
  /** Async function to update a theme and return the result. */
  updateThemeAsync: (variables: UpdateThemeVariables) => Promise<Theme>;
  /** Whether the mutation is currently pending. */
  isPending: boolean;
  /** Whether the mutation succeeded. */
  isSuccess: boolean;
  /** Whether the mutation failed. */
  isError: boolean;
  /** Error object if the mutation failed. */
  error: ApiError | null;
  /** The updated theme data if successful. */
  data: Theme | null;
  /** Reset the mutation state. */
  reset: () => void;
}

/**
 * Hook to update an existing theme with cache invalidation.
 *
 * @param options - Mutation options including callbacks.
 * @returns Mutation result with update function and status.
 */
export function useUpdateTheme(
  options?: UseUpdateThemeOptions,
): UseUpdateThemeResult {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled } = options ?? {};

  const mutation = useMutation({
    mutationFn: async ({ id, input }: UpdateThemeVariables) => {
      const response = await updateTheme(id, input);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the cache for the specific theme.
      queryClient.setQueryData(themeKeys.detail(variables.id), {
        success: true,
        data,
      });
      // Invalidate the themes list to refetch with updated data.
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
    updateTheme: (variables) => mutation.mutate(variables),
    updateThemeAsync: async (variables) => mutation.mutateAsync(variables),
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error as ApiError | null,
    data: mutation.data ?? null,
    reset: mutation.reset,
  };
}
