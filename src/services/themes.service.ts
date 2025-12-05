import type {
  CreateThemeInput,
  UpdateThemeInput,
  ListThemesParams,
  PaginatedThemesResponse,
  ThemeResponse,
  ThemeDeleteResponse,
  ApiErrorResponse,
} from "@/types/themes.types";
import env from "@/env";

/** Base API URL from validated environment variables. */
const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

/** Session token for authenticated API requests. */
let sessionToken: string | null = null;

/**
 * Sets the session token for authenticated API requests.
 * Call this function after successful authentication to inject the token.
 *
 * @param token - The session token to use for API requests, or null to clear.
 */
export function setSessionToken(token: string | null): void {
  sessionToken = token;
}

/**
 * Gets the current session token.
 *
 * @returns The current session token or null if not set.
 */
export function getSessionToken(): string | null {
  return sessionToken;
}

/**
 * Custom error class for API errors.
 */
export class ApiError extends Error {
  /** Error type code. */
  readonly type: string;
  /** HTTP status code. */
  readonly statusCode: number;
  /** Additional error details. */
  readonly details?: Record<string, string[]>;

  constructor(
    message: string,
    type: string,
    statusCode: number,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
  }
}

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
  if (sessionToken) {
    headers.Authorization = `Bearer ${sessionToken}`;
  }

  return headers;
}

/**
 * Fetches a paginated list of themes.
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

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  });

  return handleResponse<PaginatedThemesResponse>(response);
}

/**
 * Fetches a single theme by ID.
 *
 * @param id - Theme ID.
 * @returns Theme response.
 * @throws ApiError if the theme is not found or request fails.
 */
export async function getTheme(id: number): Promise<ThemeResponse> {
  const response = await fetch(`${API_BASE_URL}/themes/${id}`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  });

  return handleResponse<ThemeResponse>(response);
}

/**
 * Creates a new theme.
 *
 * @param input - Theme creation data.
 * @returns Created theme response.
 * @throws ApiError if the request fails.
 */
export async function createTheme(
  input: CreateThemeInput,
): Promise<ThemeResponse> {
  const response = await fetch(`${API_BASE_URL}/themes`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(input),
  });

  return handleResponse<ThemeResponse>(response);
}

/**
 * Updates an existing theme.
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
  const response = await fetch(`${API_BASE_URL}/themes/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(input),
  });

  return handleResponse<ThemeResponse>(response);
}

/**
 * Deletes a theme by ID.
 *
 * @param id - Theme ID to delete.
 * @returns Deletion confirmation response.
 * @throws ApiError if the theme is not found or request fails.
 */
export async function deleteTheme(id: number): Promise<ThemeDeleteResponse> {
  const response = await fetch(`${API_BASE_URL}/themes/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include",
  });

  return handleResponse<ThemeDeleteResponse>(response);
}
