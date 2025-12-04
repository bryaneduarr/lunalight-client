"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { draftKeys } from "@/lib/query-client";
import { saveDraft, getDraft, discardDraft } from "@/services/drafts.service";
import type { SaveDraftInput, Draft } from "@/types/drafts.types";
import type { ApiError } from "@/services/themes.service";

/**
 * Options for the useSaveDraft mutation hook.
 */
interface UseSaveDraftOptions {
  /** Callback invoked when the mutation succeeds. */
  onSuccess?: (draft: Draft) => void;
  /** Callback invoked when the mutation fails. */
  onError?: (error: ApiError) => void;
  /** Callback invoked when the mutation settles (success or error). */
  onSettled?: () => void;
}

/**
 * Variables for the save draft mutation.
 */
interface SaveDraftVariables {
  /** Theme ID to save the draft for. */
  themeId: number;
  /** Draft data to save. */
  input: SaveDraftInput;
}

/**
 * Return type for the useSaveDraft hook.
 */
interface UseSaveDraftResult {
  /** Function to save a draft. */
  saveDraft: (variables: SaveDraftVariables) => void;
  /** Async function to save a draft and return the result. */
  saveDraftAsync: (variables: SaveDraftVariables) => Promise<Draft>;
  /** Whether the mutation is currently pending. */
  isPending: boolean;
  /** Whether the mutation succeeded. */
  isSuccess: boolean;
  /** Whether the mutation failed. */
  isError: boolean;
  /** Error object if the mutation failed. */
  error: ApiError | null;
  /** The saved draft data if successful. */
  data: Draft | null;
  /** Reset the mutation state. */
  reset: () => void;
}

/**
 * Hook to save or update a theme draft.
 *
 * Implements auto-save logic - creates a new draft if none exists,
 * otherwise updates the existing one.
 *
 * @param options - Mutation options including callbacks.
 * @returns Mutation result with save function and status.
 */
export function useSaveDraft(
  options?: UseSaveDraftOptions,
): UseSaveDraftResult {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled } = options ?? {};

  const mutation = useMutation({
    mutationFn: async ({ themeId, input }: SaveDraftVariables) => {
      const response = await saveDraft(themeId, input);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the draft cache with the new data.
      queryClient.setQueryData(draftKeys.detail(variables.themeId), {
        success: true,
        data,
      });
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
    saveDraft: (variables) => mutation.mutate(variables),
    saveDraftAsync: async (variables) => mutation.mutateAsync(variables),
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error as ApiError | null,
    data: mutation.data ?? null,
    reset: mutation.reset,
  };
}

/**
 * Options for the useDraft query hook.
 */
interface UseDraftOptions {
  /** Whether the query is enabled. */
  enabled?: boolean;
}

/**
 * Return type for the useDraft hook.
 */
interface UseDraftResult {
  /** The draft data. */
  draft: Draft | null;
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
 * Hook to fetch and cache a draft by theme ID.
 *
 * @param themeId - The theme ID to fetch the draft for.
 * @param options - Hook options including enabled flag.
 * @returns Query result with draft data and loading state.
 */
export function useDraft(
  themeId: number,
  options?: UseDraftOptions,
): UseDraftResult {
  const { enabled = true } = options ?? {};

  const query = useQuery({
    queryKey: draftKeys.detail(themeId),
    queryFn: () => getDraft(themeId),
    enabled: enabled && themeId > 0,
    // Drafts should be fresh since they're actively edited.
    staleTime: 10 * 1000, // 10 seconds.
  });

  return {
    draft: query.data?.data ?? null,
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
 * Options for the useDiscardDraft mutation hook.
 */
interface UseDiscardDraftOptions {
  /** Callback invoked when the mutation succeeds. */
  onSuccess?: (themeId: number) => void;
  /** Callback invoked when the mutation fails. */
  onError?: (error: ApiError) => void;
  /** Callback invoked when the mutation settles (success or error). */
  onSettled?: () => void;
}

/**
 * Return type for the useDiscardDraft hook.
 */
interface UseDiscardDraftResult {
  /** Function to discard a draft. */
  discardDraft: (themeId: number) => void;
  /** Async function to discard a draft and return the theme ID. */
  discardDraftAsync: (themeId: number) => Promise<number>;
  /** Whether the mutation is currently pending. */
  isPending: boolean;
  /** Whether the mutation succeeded. */
  isSuccess: boolean;
  /** Whether the mutation failed. */
  isError: boolean;
  /** Error object if the mutation failed. */
  error: ApiError | null;
  /** Reset the mutation state. */
  reset: () => void;
}

/**
 * Hook to discard (delete) a theme draft.
 *
 * @param options - Mutation options including callbacks.
 * @returns Mutation result with discard function and status.
 */
export function useDiscardDraft(
  options?: UseDiscardDraftOptions,
): UseDiscardDraftResult {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled } = options ?? {};

  const mutation = useMutation({
    mutationFn: async (themeId: number) => {
      await discardDraft(themeId);
      return themeId;
    },
    onSuccess: (themeId) => {
      // Remove the draft from cache.
      queryClient.removeQueries({ queryKey: draftKeys.detail(themeId) });
      onSuccess?.(themeId);
    },
    onError: (error: ApiError) => {
      onError?.(error);
    },
    onSettled: () => {
      onSettled?.();
    },
  });

  return {
    discardDraft: (themeId) => mutation.mutate(themeId),
    discardDraftAsync: async (themeId) => mutation.mutateAsync(themeId),
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error as ApiError | null,
    reset: mutation.reset,
  };
}
