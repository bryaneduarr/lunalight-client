/**
 * Represents a theme draft in the application.
 */
export interface Draft {
  /** Unique identifier for the draft. */
  id: number;
  /** Theme ID this draft belongs to. */
  themeId: number;
  /** User ID who owns this draft. */
  userId: number;
  /** Liquid template files stored as key-value pairs. */
  liquidFiles: Record<string, string>;
  /** Timestamp when the draft was last edited. */
  lastEditedAt: string;
}

/**
 * Input for saving/updating a draft.
 */
export interface SaveDraftInput {
  /** The Liquid files to save in the draft. */
  liquidFiles: Record<string, string>;
}

/**
 * Single draft response.
 */
export interface DraftResponse {
  /** Success indicator. */
  success: true;
  /** Draft data. */
  data: Draft;
  /** Optional message. */
  message?: string;
}

/**
 * Draft deletion response.
 */
export interface DraftDeleteResponse {
  /** Success indicator. */
  success: true;
  /** Deletion confirmation data. */
  data: {
    /** Indicates the draft was deleted. */
    deleted: true;
    /** Theme ID of the deleted draft. */
    themeId: number;
  };
  /** Optional message. */
  message?: string;
}
