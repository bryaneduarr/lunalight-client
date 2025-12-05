import type {
  SaveDraftInput,
  DraftResponse,
  DraftDeleteResponse,
} from "@/types/drafts.types";
import type { ApiErrorResponse } from "@/types/themes.types";
import { ApiError, getSessionToken } from "@/services/themes.service";
import env from "@/env";

/** Base API URL from validated environment variables. */
const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

/**
 * Gets the default headers for API requests.
 * Includes the session token in the Authorization header when available.
 *
 * @returns Headers object with content type and authorization.
 */
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Inject session token when available for authenticated requests.
  const token = getSessionToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Handles API response and throws ApiError if request failed.
 *
 * @param response - Fetch response object.
 * @returns Parsed JSON response.
 * @throws ApiError if the response indicates failure.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const json = await response.json();

  if (!response.ok || json.success === false) {
    const errorResponse = json as ApiErrorResponse;
    throw new ApiError(
      errorResponse.error?.message ?? "An unknown error occurred.",
      errorResponse.error?.type ?? "UNKNOWN_ERROR",
      response.status,
      errorResponse.error?.details,
    );
  }

  return json as T;
}

/**
 * Fetches the current draft for a theme.
 *
 * @param themeId - Theme ID to get the draft for.
 * @returns Draft response.
 * @throws ApiError if the draft is not found or request fails.
 */
export async function getDraft(themeId: number): Promise<DraftResponse> {
  const response = await fetch(`${API_BASE_URL}/themes/${themeId}/draft`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  });

  return handleResponse<DraftResponse>(response);
}

/**
 * Saves or updates a draft for a theme.
 *
 * @param themeId - Theme ID to save the draft for.
 * @param input - Draft data to save.
 * @returns Saved draft response.
 * @throws ApiError if the theme is not found or request fails.
 */
export async function saveDraft(
  themeId: number,
  input: SaveDraftInput,
): Promise<DraftResponse> {
  const response = await fetch(`${API_BASE_URL}/themes/${themeId}/draft`, {
    method: "PUT",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(input),
  });

  return handleResponse<DraftResponse>(response);
}

/**
 * Discards (deletes) a draft for a theme.
 *
 * @param themeId - Theme ID to discard the draft for.
 * @returns Deletion confirmation response.
 * @throws ApiError if the draft is not found or request fails.
 */
export async function discardDraft(
  themeId: number,
): Promise<DraftDeleteResponse> {
  const response = await fetch(`${API_BASE_URL}/themes/${themeId}/draft`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include",
  });

  return handleResponse<DraftDeleteResponse>(response);
}
