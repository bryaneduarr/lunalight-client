/**
 * Represents a single step in the wizard flow.
 */
export interface WizardStep {
  /** Unique identifier for the step. */
  id: string;
  /** Display title for the step. */
  title: string;
  /** Short description of what the step involves. */
  description: string;
  /** Icon name from lucide-react (optional). */
  icon?: string;
}

/**
 * Brand information step data.
 */
export interface BrandInfoData {
  /** Brand name (default: "Your Brand"). */
  brandName: string;
  /** Brand description (optional). */
  brandDescription: string;
}

/**
 * Color and style step data.
 */
export interface ColorStyleData {
  /** Selected color palette ID or custom palette. */
  paletteId: string | null;
  /** Custom primary color if using custom palette. */
  primaryColor: string;
  /** Custom secondary color if using custom palette. */
  secondaryColor: string;
  /** Custom accent color if using custom palette. */
  accentColor: string;
  /** Reference image URLs for design inspiration. */
  referenceImages: string[];
}

/**
 * Vision prompt step data.
 */
export interface VisionPromptData {
  /** The AI prompt describing desired store look and feel (required). */
  prompt: string;
}

/**
 * Product information for manual entry.
 */
export interface ProductInfo {
  /** Unique ID for the product (client-side generated). */
  id: string;
  /** Product name. */
  name: string;
  /** Product description. */
  description: string;
  /** Product price as string. */
  price: string;
  /** Product image URL (optional). */
  imageUrl: string;
}

/**
 * Products step data.
 */
export interface ProductsData {
  /** How products are sourced: 'import' from Shopify or 'manual' entry. */
  sourceType: "import" | "manual";
  /** List of manually entered products. */
  manualProducts: ProductInfo[];
  /** Flag indicating if products have been imported. */
  hasImportedProducts: boolean;
}

/**
 * Complete wizard data combining all steps.
 */
export interface WizardData {
  /** Brand information step data. */
  brandInfo: BrandInfoData;
  /** Color and style step data. */
  colorStyle: ColorStyleData;
  /** Vision prompt step data. */
  visionPrompt: VisionPromptData;
  /** Products step data. */
  products: ProductsData;
}

/**
 * Validation result for a step.
 */
export interface StepValidationResult {
  /** Whether the step is valid. */
  isValid: boolean;
  /** Validation error messages by field. */
  errors: Record<string, string>;
}

/**
 * Wizard state for localStorage persistence.
 */
export interface WizardPersistState {
  /** Current step index (0-based). */
  currentStep: number;
  /** Wizard form data. */
  data: WizardData;
  /** Timestamp of last save. */
  lastSavedAt: string;
}

/**
 * Predefined color palette option.
 */
export interface ColorPalette {
  /** Unique palette identifier. */
  id: string;
  /** Display name for the palette. */
  name: string;
  /** Primary color in hex format. */
  primary: string;
  /** Secondary color in hex format. */
  secondary: string;
  /** Accent color in hex format. */
  accent: string;
}
