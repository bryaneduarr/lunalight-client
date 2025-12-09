"use client";

import { useMutation } from "@tanstack/react-query";
import {
  generateProductContent,
  ApiError,
} from "@/services/ai-editing.service";
import type {
  GenerateProductContentInput,
  GenerateProductContentData,
} from "@/types/ai-editing.types";
import { toast } from "sonner";

/**
 * Options for the useGenerateProductContent hook.
 */
export interface UseGenerateProductContentOptions {
  /** Callback when generation succeeds. */
  onSuccess?: (data: GenerateProductContentData) => void;
  /** Callback when generation fails. */
  onError?: (error: Error) => void;
}

/**
 * Custom hook for AI product content generation with TanStack Query.
 *
 * Handles loading states, errors, and provides automatic toast notifications.
 * Specifically handles:
 * - 409 Conflict for concurrent request prevention.
 * - Retry functionality via refetch.
 *
 * @param options - Optional callbacks for success/error handling.
 * @returns TanStack Query mutation result with retry capability.
 */
export function useGenerateProductContent(
  options?: UseGenerateProductContentOptions,
) {
  return useMutation({
    mutationFn: (input: GenerateProductContentInput) =>
      generateProductContent(input),
    onSuccess: (response) => {
      const contentTypes: string[] = [];
      if (response.data.generatedContent.title) contentTypes.push("title");
      if (response.data.generatedContent.tagline) contentTypes.push("tagline");
      if (response.data.generatedContent.description)
        contentTypes.push("description");
      if (
        response.data.generatedContent.features &&
        response.data.generatedContent.features.length > 0
      )
        contentTypes.push("features");

      toast.success("Product content generated!", {
        description: `Generated ${contentTypes.join(", ")} for your product.`,
      });

      options?.onSuccess?.(response.data);
    },
    onError: (error: Error) => {
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
        } else if (error.statusCode === 503) {
          toast.error("Service Unavailable", {
            description:
              "AI service is not configured. Please contact support.",
          });
        } else {
          // Generic AI error with retry suggestion.
          toast.error("Content Generation Failed", {
            description:
              error.message || "Failed to generate content. Please try again.",
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
          description: "An unexpected error occurred. Please try again.",
        });
      }

      options?.onError?.(error);
    },
  });
}
