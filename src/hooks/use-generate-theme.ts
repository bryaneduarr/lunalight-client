"use client";

import { useMutation } from "@tanstack/react-query";
import { generateTheme, ApiError } from "@/services/theme-generation.service";
import type {
  GenerateThemeInput,
  GeneratedThemeData,
} from "@/types/theme-generation.types";
import { toast } from "sonner";

/**
 * Options for the useGenerateTheme hook.
 */
export interface UseGenerateThemeOptions {
  /** Callback when generation succeeds. */
  onSuccess?: (data: GeneratedThemeData) => void;
  /** Callback when generation fails. */
  onError?: (error: Error) => void;
}

/**
 * Custom hook for AI theme generation with TanStack Query.
 *
 * Handles loading states, errors, and provides automatic toast notifications.
 * Specifically handles 409 Conflict for concurrent request prevention.
 *
 * @param options - Optional callbacks for success/error handling.
 * @returns TanStack Query mutation result.
 */
export function useGenerateTheme(options?: UseGenerateThemeOptions) {
  return useMutation({
    mutationFn: (input: GenerateThemeInput) => generateTheme(input),
    onSuccess: (response) => {
      toast.success("Theme generated successfully!", {
        description: `Created "${response.data.themeName}" with ${Object.keys(response.data.liquidFiles).length} files.`,
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
              "An AI generation is already in progress. Please wait for it to complete.",
          });
        } else if (error.statusCode === 503) {
          toast.error("Service Unavailable", {
            description:
              "AI service is not configured. Please contact support.",
          });
        } else {
          toast.error("Theme Generation Failed", {
            description:
              error.message || "Failed to generate theme. Please try again.",
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
