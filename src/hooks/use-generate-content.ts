"use client";

import { useMutation } from "@tanstack/react-query";
import {
  generateContent,
  type GenerateContentInput,
  ApiError,
} from "@/services/ai.service";
import { toast } from "sonner";

/**
 * Options for the useGenerateContent hook.
 */
export interface UseGenerateContentOptions {
  /** Callback when generation succeeds. */
  onSuccess?: (data: {
    text: string;
    model: string;
    generatedAt: string;
  }) => void;
  /** Callback when generation fails. */
  onError?: (error: Error) => void;
}

/**
 * Custom hook for AI content generation with TanStack Query.
 *
 * Handles loading states, errors, and provides automatic toast notifications.
 * Specifically handles 409 Conflict for concurrent request prevention.
 *
 * @param options - Optional callbacks for success/error handling.
 * @returns TanStack Query mutation result.
 */
export function useGenerateContent(options?: UseGenerateContentOptions) {
  return useMutation({
    mutationFn: (input: GenerateContentInput) => generateContent(input),
    onSuccess: (response) => {
      toast.success("Content generated successfully");
      options?.onSuccess?.(response.data);
    },
    onError: (error: Error) => {
      // Handle ApiError specifically.
      if (error instanceof ApiError) {
        // Handle 409 Conflict (concurrent request).
        if (error.statusCode === 409) {
          toast.error("Request in Progress", {
            description:
              "An AI generation is already in progress. Please wait for it to complete.",
          });
        } else {
          toast.error("Generation Failed", {
            description:
              error.message || "Failed to generate content. Please try again.",
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
