/**
 * Theme status enum representing the current state of a theme.
 */
export type ThemeStatus = "draft" | "published";

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
  /** Optional preview image URL for the theme. */
  previewUrl: string | null;
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
