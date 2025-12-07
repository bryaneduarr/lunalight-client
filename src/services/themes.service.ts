import type {
  CreateThemeInput,
  UpdateThemeInput,
  ListThemesParams,
  PaginatedThemesResponse,
  ThemeResponse,
  ThemeDeleteResponse,
} from "@/types/themes.types";
import { authenticatedJsonFetch } from "@/services/authenticated-fetch";
import env from "@/env";

/** Re-export ApiError from authenticated-fetch for backward compatibility. */
export { ApiError } from "@/services/authenticated-fetch";

/** Base API URL from validated environment variables. */
const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

/**
 * Builds URL search params from an object, filtering out undefined values.
 *
 * @param params - Object with query parameters.
 * @returns URLSearchParams instance.
 */
function buildSearchParams(
  params: Record<string, string | number | undefined>,
): URLSearchParams {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  }
  return searchParams;
}

/**
 * Fetches a paginated list of themes.
 * Uses authenticatedFetch for automatic token management and refresh.
 *
 * @param params - Optional query parameters for filtering/pagination.
 * @returns Paginated themes response.
 * @throws ApiError if the request fails.
 */
export async function getThemes(
  params?: ListThemesParams,
): Promise<PaginatedThemesResponse> {
  const searchParams = buildSearchParams({
    status: params?.status,
    page: params?.page,
    perPage: params?.perPage,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
  });

  const url = `${API_BASE_URL}/themes${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  return authenticatedJsonFetch<PaginatedThemesResponse>(url);
}

/**
 * Fetches a single theme by ID.
 * Uses authenticatedFetch for automatic token management and refresh.
 *
 * @param id - Theme ID.
 * @returns Theme response.
 * @throws ApiError if the theme is not found or request fails.
 */
export async function getTheme(id: number): Promise<ThemeResponse> {
  return authenticatedJsonFetch<ThemeResponse>(`${API_BASE_URL}/themes/${id}`);
}

/**
 * Creates a new theme.
 * Uses authenticatedFetch for automatic token management and refresh.
 *
 * @param input - Theme creation data.
 * @returns Created theme response.
 * @throws ApiError if the request fails.
 */
export async function createTheme(
  input: CreateThemeInput,
): Promise<ThemeResponse> {
  return authenticatedJsonFetch<ThemeResponse>(`${API_BASE_URL}/themes`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Updates an existing theme.
 * Uses authenticatedFetch for automatic token management and refresh.
 *
 * @param id - Theme ID to update.
 * @param input - Theme update data.
 * @returns Updated theme response.
 * @throws ApiError if the theme is not found or request fails.
 */
export async function updateTheme(
  id: number,
  input: UpdateThemeInput,
): Promise<ThemeResponse> {
  return authenticatedJsonFetch<ThemeResponse>(`${API_BASE_URL}/themes/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

/**
 * Deletes a theme by ID.
 * Uses authenticatedFetch for automatic token management and refresh.
 *
 * @param id - Theme ID to delete.
 * @returns Deletion confirmation response.
 * @throws ApiError if the theme is not found or request fails.
 */
export async function deleteTheme(id: number): Promise<ThemeDeleteResponse> {
  return authenticatedJsonFetch<ThemeDeleteResponse>(
    `${API_BASE_URL}/themes/${id}`,
    {
      method: "DELETE",
    },
  );
}
