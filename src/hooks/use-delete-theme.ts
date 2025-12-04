"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { themeKeys, draftKeys } from "@/lib/query-client";
import { deleteTheme } from "@/services/themes.service";
import type { ApiError } from "@/services/themes.service";

/**
 * Options for the useDeleteTheme mutation hook.
 */
interface UseDeleteThemeOptions {
  /** Callback invoked when the mutation succeeds. */
  onSuccess?: (id: number) => void;
  /** Callback invoked when the mutation fails. */
  onError?: (error: ApiError) => void;
  /** Callback invoked when the mutation settles (success or error). */
  onSettled?: () => void;
}

/**
 * Return type for the useDeleteTheme hook.
 */
interface UseDeleteThemeResult {
  /** Function to delete a theme. */
  deleteTheme: (id: number) => void;
  /** Async function to delete a theme and return the result. */
  deleteThemeAsync: (id: number) => Promise<number>;
  /** Whether the mutation is currently pending. */
  isPending: boolean;
  /** Whether the mutation succeeded. */
  isSuccess: boolean;
  /** Whether the mutation failed. */
  isError: boolean;
  /** Error object if the mutation failed. */
  error: ApiError | null;
  /** The ID of the deleted theme if successful. */
  deletedId: number | null;
  /** Reset the mutation state. */
  reset: () => void;
}

/**
 * Hook to delete a theme with cache invalidation.
 *
 * @param options - Mutation options including callbacks.
 * @returns Mutation result with delete function and status.
 *
 * @example
 * ```tsx
 * function DeleteThemeButton({ themeId }: { themeId: number }) {
 *   const { deleteTheme, isPending } = useDeleteTheme({
 *     onSuccess: () => {
 *       toast.success('Theme deleted successfully!');
 *     },
 *     onError: (error) => {
 *       toast.error(error.message);
 *     },
 *   });
 *
 *   return (
 *     <button
 *       onClick={() => deleteTheme(themeId)}
 *       disabled={isPending}
 *     >
 *       {isPending ? 'Deleting...' : 'Delete Theme'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useDeleteTheme(
  options?: UseDeleteThemeOptions,
): UseDeleteThemeResult {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled } = options ?? {};

  const mutation = useMutation({
    mutationFn: async (id: number) => {
      await deleteTheme(id);
      return id;
    },
    onSuccess: (id) => {
      // Remove the specific theme from cache.
      queryClient.removeQueries({ queryKey: themeKeys.detail(id) });
      // Also remove any associated draft.
      queryClient.removeQueries({ queryKey: draftKeys.detail(id) });
      // Invalidate the themes list to refetch without deleted theme.
      queryClient.invalidateQueries({ queryKey: themeKeys.lists() });
      onSuccess?.(id);
    },
    onError: (error: ApiError) => {
      onError?.(error);
    },
    onSettled: () => {
      onSettled?.();
    },
  });

  return {
    deleteTheme: (id) => mutation.mutate(id),
    deleteThemeAsync: async (id) => mutation.mutateAsync(id),
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error as ApiError | null,
    deletedId: mutation.data ?? null,
    reset: mutation.reset,
  };
}
