import {
  authenticatedJsonFetch,
  ApiError,
} from "@/services/authenticated-fetch";
import env from "@/env";

/** Base API URL from validated environment variables. */
const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

/**
 * Request parameters for AI content generation.
 */
export interface GenerateContentInput {
  /** The prompt to send to the AI model. */
  prompt: string;
  /** Optional system instruction to guide the AI response. */
  systemInstruction?: string;
}

/**
 * Response data from AI content generation.
 */
export interface GenerateContentData {
  /** The AI-generated text response. */
  text: string;
  /** The model used for generation. */
  model: string;
  /** ISO 8601 timestamp of generation. */
  generatedAt: string;
}

/**
 * Success response from AI generation endpoint.
 */
export interface GenerateContentResponse {
  success: true;
  data: GenerateContentData;
}

/**
 * Generates AI content using the Gemini API.
 *
 * @param input - The generation parameters.
 * @returns Generated content response.
 * @throws ApiError if the request fails (including 409 for concurrent requests).
 */
export async function generateContent(
  input: GenerateContentInput,
): Promise<GenerateContentResponse> {
  return authenticatedJsonFetch<GenerateContentResponse>(
    `${API_BASE_URL}/ai/generate`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

/** Re-export ApiError for backward compatibility. */
export { ApiError };
