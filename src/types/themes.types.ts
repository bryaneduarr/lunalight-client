/**
 * Theme status enum representing the current state of a theme.
 */
export type ThemeStatus = "draft" | "published" | "archived";

/**
 * Represents a Shopify Liquid theme in the application.
 */
export interface Theme {
  /** Unique identifier for the theme. */
  id: number;
  /** The ID of the user who owns this theme. */
  userId: number;
  /** Display name of the theme. */
  name: string;
  /** Optional Shopify theme ID if published. */
  shopifyThemeId: string | null;
  /** Current status of the theme. */
  status: ThemeStatus;
  /** Liquid template files stored as key-value pairs. */
  liquidFiles: Record<string, string>;
  /** Timestamp when the theme was created. */
  createdAt: string;
  /** Timestamp when the theme was last updated. */
  updatedAt: string;
}

/**
 * Simplified theme data for list views.
 */
export interface ThemeListItem {
  /** Unique identifier for the theme. */
  id: number;
  /** Display name of the theme. */
  name: string;
  /** Current status of the theme. */
  status: ThemeStatus;
  /** Optional preview image URL. */
  previewUrl: string | null;
  /** Timestamp when the theme was created. */
  createdAt: string;
  /** Timestamp when the theme was last updated. */
  updatedAt: string;
}

/**
 * Input for creating a new theme.
 */
export interface CreateThemeInput {
  /** User-friendly name for the theme. */
  name: string;
  /** Optional initial Liquid files. */
  liquidFiles?: Record<string, string>;
}

/**
 * Input for updating an existing theme.
 */
export interface UpdateThemeInput {
  /** Updated theme name. */
  name?: string;
  /** Updated Shopify theme ID. */
  shopifyThemeId?: string | null;
  /** Updated theme status. */
  status?: ThemeStatus;
  /** Updated Liquid files. */
  liquidFiles?: Record<string, string>;
}

/**
 * Query parameters for listing themes.
 */
export interface ListThemesParams {
  /** Filter by theme status. */
  status?: ThemeStatus;
  /** Page number (1-indexed). */
  page?: number;
  /** Number of items per page. */
  perPage?: number;
  /** Field to sort by. */
  sortBy?: "name" | "createdAt" | "updatedAt";
  /** Sort order. */
  sortOrder?: "asc" | "desc";
}

/**
 * Pagination metadata for list responses.
 */
export interface PaginationMeta {
  /** Current page number. */
  page: number;
  /** Items per page. */
  perPage: number;
  /** Total number of items. */
  total: number;
  /** Total number of pages. */
  totalPages: number;
  /** Whether there's a next page. */
  hasNextPage: boolean;
  /** Whether there's a previous page. */
  hasPreviousPage: boolean;
}

/**
 * Paginated themes list response.
 */
export interface PaginatedThemesResponse {
  /** Success indicator. */
  success: true;
  /** List of themes. */
  data: Theme[];
  /** Pagination metadata. */
  pagination: PaginationMeta;
  /** Optional message. */
  message?: string;
}

/**
 * Single theme response.
 */
export interface ThemeResponse {
  /** Success indicator. */
  success: true;
  /** Theme data. */
  data: Theme;
  /** Optional message. */
  message?: string;
}

/**
 * Theme deletion response.
 */
export interface ThemeDeleteResponse {
  /** Success indicator. */
  success: true;
  /** Deletion confirmation data. */
  data: {
    /** Indicates the theme was deleted. */
    deleted: true;
    /** ID of the deleted theme. */
    id: number;
  };
  /** Optional message. */
  message?: string;
}

/**
 * API error response structure.
 */
export interface ApiErrorResponse {
  /** Success indicator (always false for errors). */
  success: false;
  /** Error details. */
  error: {
    /** Error type code. */
    type: string;
    /** Human-readable error message. */
    message: string;
    /** Additional error details. */
    details?: Record<string, string[]>;
  };
}
