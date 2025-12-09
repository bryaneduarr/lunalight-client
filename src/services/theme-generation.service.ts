import {
  authenticatedJsonFetch,
  ApiError,
} from "@/services/authenticated-fetch";
import env from "@/env";
import type {
  GenerateThemeInput,
  GenerateThemeResponse,
} from "@/types/theme-generation.types";

/** Base API URL from validated environment variables. */
const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

/**
 * Generates a complete Shopify Liquid theme using AI.
 *
 * @param input - The theme generation parameters.
 * @returns Generated theme response with Liquid files.
 * @throws ApiError if the request fails (including 409 for concurrent requests).
 */
export async function generateTheme(
  input: GenerateThemeInput,
): Promise<GenerateThemeResponse> {
  return authenticatedJsonFetch<GenerateThemeResponse>(
    `${API_BASE_URL}/ai/generate-theme`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

/** Re-export ApiError for backward compatibility. */
export { ApiError };
