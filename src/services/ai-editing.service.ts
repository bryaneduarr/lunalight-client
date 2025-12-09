import {
  authenticatedJsonFetch,
  ApiError,
} from "@/services/authenticated-fetch";
import env from "@/env";
import type {
  EditElementInput,
  EditElementResponse,
  GenerateProductContentInput,
  GenerateProductContentResponse,
} from "@/types/ai-editing.types";

/** Base API URL from validated environment variables. */
const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

/**
 * Edits a specific element in a theme using AI.
 *
 * @param input - The element edit parameters.
 * @returns Edited element response with updated Liquid files.
 * @throws ApiError if the request fails (including 409 for concurrent requests).
 */
export async function editElement(
  input: EditElementInput,
): Promise<EditElementResponse> {
  return authenticatedJsonFetch<EditElementResponse>(
    `${API_BASE_URL}/ai/edit-element`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

/**
 * Generates AI-powered product content.
 *
 * @param input - The product content generation parameters.
 * @returns Generated product content response.
 * @throws ApiError if the request fails (including 409 for concurrent requests).
 */
export async function generateProductContent(
  input: GenerateProductContentInput,
): Promise<GenerateProductContentResponse> {
  return authenticatedJsonFetch<GenerateProductContentResponse>(
    `${API_BASE_URL}/ai/generate-product-content`,
    {
      method: "POST",
      body: JSON.stringify({
        ...input,
        contentType: input.contentType ?? "description",
        tone: input.tone ?? "professional",
      }),
    },
  );
}

/** Re-export ApiError for external use. */
export { ApiError };
