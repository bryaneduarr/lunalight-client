import type {
  SaveDraftInput,
  DraftResponse,
  DraftDeleteResponse,
} from "@/types/drafts.types";
import { authenticatedJsonFetch } from "@/services/authenticated-fetch";
import env from "@/env";

/** Re-export ApiError from authenticated-fetch for backward compatibility. */
export { ApiError } from "@/services/authenticated-fetch";

/** Base API URL from validated environment variables. */
const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

/**
 * Fetches the current draft for a theme.
 * Uses authenticatedFetch for automatic token management and refresh.
 *
 * @param themeId - Theme ID to get the draft for.
 * @returns Draft response.
 * @throws ApiError if the draft is not found or request fails.
 */
export async function getDraft(themeId: number): Promise<DraftResponse> {
  return authenticatedJsonFetch<DraftResponse>(
    `${API_BASE_URL}/themes/${themeId}/draft`,
  );
}

/**
 * Saves or updates a draft for a theme.
 * Uses authenticatedFetch for automatic token management and refresh.
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
  return authenticatedJsonFetch<DraftResponse>(
    `${API_BASE_URL}/themes/${themeId}/draft`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
}

/**
 * Discards (deletes) a draft for a theme.
 * Uses authenticatedFetch for automatic token management and refresh.
 *
 * @param themeId - Theme ID to discard the draft for.
 * @returns Deletion confirmation response.
 * @throws ApiError if the draft is not found or request fails.
 */
export async function discardDraft(
  themeId: number,
): Promise<DraftDeleteResponse> {
  return authenticatedJsonFetch<DraftDeleteResponse>(
    `${API_BASE_URL}/themes/${themeId}/draft`,
    {
      method: "DELETE",
    },
  );
}
