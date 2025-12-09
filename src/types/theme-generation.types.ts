/**
 * Product information for theme generation.
 */
export interface GenerationProduct {
  /** Unique identifier for the product. */
  id: string;
  /** Product name. */
  name: string;
  /** Product description. */
  description: string;
  /** Product price as string. */
  price: string;
  /** Product image URL. */
  imageUrl?: string;
}

/**
 * Brand information for theme generation.
 */
export interface GenerationBrandInfo {
  /** Brand name. */
  brandName: string;
  /** Brand description. */
  brandDescription?: string;
}

/**
 * Color scheme for theme generation.
 */
export interface GenerationColorScheme {
  /** Primary color in hex format. */
  primaryColor: string;
  /** Secondary color in hex format. */
  secondaryColor: string;
  /** Accent color in hex format. */
  accentColor: string;
}

/**
 * Request body for theme generation.
 */
export interface GenerateThemeInput {
  /** Brand information. */
  brandInfo: GenerationBrandInfo;
  /** Color scheme. */
  colorScheme: GenerationColorScheme;
  /** User's vision for the store design. */
  visionPrompt: string;
  /** Products to include in the theme. */
  products?: GenerationProduct[];
  /** Reference image URLs for design inspiration. */
  referenceImageUrls?: string[];
}

/**
 * Generated theme data returned from the API.
 */
export interface GeneratedThemeData {
  /** Generated theme name. */
  themeName: string;
  /** Generated Liquid theme files. */
  liquidFiles: Record<string, string>;
  /** AI model used for generation. */
  model: string;
  /** ISO 8601 timestamp of generation. */
  generatedAt: string;
}

/**
 * Success response from theme generation endpoint.
 */
export interface GenerateThemeResponse {
  success: true;
  data: GeneratedThemeData;
}

/**
 * Error response from theme generation endpoint.
 */
export interface GenerateThemeErrorResponse {
  success: false;
  error: {
    type: string;
    message: string;
  };
}
