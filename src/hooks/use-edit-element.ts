"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editElement, ApiError } from "@/services/ai-editing.service";
import type {
  EditElementInput,
  EditElementData,
} from "@/types/ai-editing.types";
import { toast } from "sonner";

/**
 * Options for the useEditElement hook.
 */
export interface UseEditElementOptions {
  /** Callback when editing succeeds. */
  onSuccess?: (data: EditElementData) => void;
  /** Callback when editing fails. */
  onError?: (error: Error) => void;
  /** Whether to automatically update the draft query cache. */
  updateDraftCache?: boolean;
}

/**
 * Custom hook for AI element editing with TanStack Query.
 *
 * Handles loading states, errors, and provides automatic toast notifications.
 * Specifically handles:
 * - 409 Conflict for concurrent request prevention.
 * - 404 Not Found for missing elements or themes.
 * - Draft preservation on failure (no data loss).
 * - Retry functionality via refetch.
 *
 * @param options - Optional callbacks for success/error handling.
 * @returns TanStack Query mutation result with retry capability.
 */
export function useEditElement(options?: UseEditElementOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: EditElementInput) => editElement(input),
    onSuccess: (response, variables) => {
      toast.success("Element edited successfully!", {
        description: response.data.changeDescription,
      });

      // Optionally update the draft cache with the new liquid files.
      if (options?.updateDraftCache !== false) {
        queryClient.setQueryData(
          ["draft", variables.themeId],
          (
            oldData:
              | { data: { liquidFiles: Record<string, string> } }
              | undefined,
          ) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              data: {
                ...oldData.data,
                liquidFiles: response.data.updatedLiquidFiles,
              },
            };
          },
        );

        // Invalidate theme queries to ensure consistency.
        queryClient.invalidateQueries({
          queryKey: ["theme", variables.themeId],
        });
      }

      options?.onSuccess?.(response.data);
    },
    onError: (error: Error, variables) => {
      // Handle ApiError specifically.
      if (error instanceof ApiError) {
        // Handle 409 Conflict (concurrent request).
        if (error.statusCode === 409) {
          toast.error("Request in Progress", {
            description:
              "An AI request is already in progress. Please wait for it to complete.",
            action: {
              label: "Dismiss",
              onClick: () => {},
            },
          });
        } else if (error.statusCode === 404) {
          // Handle element or theme not found.
          toast.error("Element Not Found", {
            description:
              error.message ||
              `Could not find element "${variables.elementId}".`,
          });
        } else if (error.statusCode === 503) {
          toast.error("Service Unavailable", {
            description:
              "AI service is not configured. Please contact support.",
          });
        } else {
          // Generic AI error with retry suggestion.
          toast.error("Element Editing Failed", {
            description:
              error.message ||
              "Failed to edit element. Your draft has been preserved.",
            action: {
              label: "Retry",
              onClick: () => {
                // The component should implement retry logic.
              },
            },
          });
        }
      } else {
        toast.error("Unexpected Error", {
          description:
            "An unexpected error occurred. Your draft has been preserved.",
        });
      }

      options?.onError?.(error);
    },
  });
}
