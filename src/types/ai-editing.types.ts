/**
 * Context information for element editing.
 */
export interface EditElementContext {
  /** Type of element (e.g., 'section', 'button', 'heading'). */
  elementType?: string;
  /** Current content/code of the element. */
  currentContent?: string;
  /** Path to the Liquid file containing the element. */
  filePath?: string;
}

/**
 * Input for editing a specific element using AI.
 */
export interface EditElementInput {
  /** The ID of the theme to edit. */
  themeId: number;
  /** The unique element ID (data-element-id attribute) to modify. */
  elementId: string;
  /** Natural language description of the desired changes. */
  prompt: string;
  /** Additional context about the element being edited. */
  context?: EditElementContext;
}

/**
 * Response data for element editing.
 */
export interface EditElementData {
  /** The element ID that was modified. */
  elementId: string;
  /** Path to the modified Liquid file. */
  filePath: string;
  /** Original content before modification. */
  originalContent: string;
  /** Modified content after AI edit. */
  modifiedContent: string;
  /** Complete updated Liquid files with the change applied. */
  updatedLiquidFiles: Record<string, string>;
  /** Human-readable description of the changes made. */
  changeDescription: string;
  /** AI model used for editing. */
  model: string;
  /** ISO 8601 timestamp of the edit. */
  editedAt: string;
}

/**
 * Success response for element editing.
 */
export interface EditElementResponse {
  success: true;
  data: EditElementData;
}

/**
 * Content type options for product content generation.
 */
export type ProductContentType =
  | "description"
  | "title"
  | "tagline"
  | "features"
  | "all";

/**
 * Tone options for product content generation.
 */
export type ProductContentTone =
  | "professional"
  | "friendly"
  | "luxury"
  | "casual"
  | "technical"
  | "playful";

/**
 * Input for generating product content.
 */
export interface GenerateProductContentInput {
  /** Shopify product ID. */
  productId: string;
  /** Product name. */
  productName: string;
  /** Existing product description to enhance or replace. */
  existingDescription?: string;
  /** Type of content to generate. */
  contentType?: ProductContentType;
  /** Tone/style of the generated content. */
  tone?: ProductContentTone;
  /** Target audience description for tailored content. */
  targetAudience?: string;
  /** SEO keywords to incorporate (max 10). */
  keywords?: string[];
  /** Additional context or requirements for the content. */
  additionalContext?: string;
}

/**
 * Generated product content data.
 */
export interface GeneratedProductContent {
  /** Generated product title. */
  title?: string;
  /** Generated product tagline. */
  tagline?: string;
  /** Generated product description. */
  description?: string;
  /** Generated feature bullet points. */
  features?: string[];
}

/**
 * Response data for product content generation.
 */
export interface GenerateProductContentData {
  /** Shopify product ID. */
  productId: string;
  /** Type of content generated. */
  contentType: ProductContentType;
  /** Generated content based on contentType. */
  generatedContent: GeneratedProductContent;
  /** AI model used for generation. */
  model: string;
  /** ISO 8601 timestamp of generation. */
  generatedAt: string;
}

/**
 * Success response for product content generation.
 */
export interface GenerateProductContentResponse {
  success: true;
  data: GenerateProductContentData;
}

/**
 * Error response from AI endpoints.
 */
export interface AIErrorResponse {
  success: false;
  error: {
    type: string;
    message: string;
  };
}
