"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type {
  WizardData,
  WizardStep,
  StepValidationResult,
  WizardPersistState,
} from "@/types/wizard.types";

/**
 * localStorage key for wizard data persistence.
 */
const WIZARD_STORAGE_KEY = "lunalight_wizard_progress";

/**
 * Wizard steps configuration.
 */
export const WIZARD_STEPS: WizardStep[] = [
  {
    id: "brand-info",
    title: "Brand Information",
    description: "Tell us about your brand",
  },
  {
    id: "color-style",
    title: "Color & Style",
    description: "Choose your color palette",
  },
  {
    id: "vision-prompt",
    title: "Vision",
    description: "Describe your ideal store",
  },
  {
    id: "products",
    title: "Products",
    description: "Add your products",
  },
  {
    id: "review",
    title: "Review",
    description: "Review and generate",
  },
];

/**
 * Default initial wizard data.
 */
const DEFAULT_WIZARD_DATA: WizardData = {
  brandInfo: {
    brandName: "",
    brandDescription: "",
  },
  colorStyle: {
    paletteId: null,
    primaryColor: "#000000",
    secondaryColor: "#ffffff",
    accentColor: "#3b82f6",
    referenceImages: [],
  },
  visionPrompt: {
    prompt: "",
  },
  products: {
    sourceType: "manual",
    manualProducts: [],
    hasImportedProducts: false,
  },
};

/**
 * Wizard context value interface.
 */
interface WizardContextValue {
  /** Current step index (0-based). */
  currentStep: number;
  /** Total number of steps. */
  totalSteps: number;
  /** Current step configuration. */
  currentStepConfig: WizardStep;
  /** All wizard steps configuration. */
  steps: WizardStep[];
  /** Current wizard data. */
  data: WizardData;
  /** Whether the current step is valid. */
  isCurrentStepValid: boolean;
  /** Current step validation result. */
  currentStepValidation: StepValidationResult;
  /** Whether there are unsaved changes. */
  hasUnsavedChanges: boolean;
  /** Whether the wizard is loading from localStorage. */
  isLoading: boolean;
  /** Go to next step (if valid). */
  nextStep: () => void;
  /** Go to previous step. */
  prevStep: () => void;
  /** Go to a specific step (for review step edits). */
  goToStep: (index: number) => void;
  /** Update wizard data for current step. */
  updateData: <K extends keyof WizardData>(
    stepKey: K,
    updates: Partial<WizardData[K]>,
  ) => void;
  /** Reset wizard to initial state. */
  resetWizard: () => void;
  /** Save current progress to localStorage. */
  saveProgress: () => void;
  /** Clear saved progress from localStorage. */
  clearSavedProgress: () => void;
  /** Validate a specific step. */
  validateStep: (stepIndex: number) => StepValidationResult;
}

const WizardContext = createContext<WizardContextValue | null>(null);

/**
 * Validates brand info step data.
 */
function validateBrandInfo(_data: WizardData): StepValidationResult {
  const errors: Record<string, string> = {};

  // Brand name is optional but has a default value "Your Brand".
  // For now, we allow empty names as well.

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates color style step data.
 */
function validateColorStyle(_data: WizardData): StepValidationResult {
  const errors: Record<string, string> = {};

  // Color step is optional and can skip with random palette.

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates vision prompt step data.
 */
function validateVisionPrompt(data: WizardData): StepValidationResult {
  const errors: Record<string, string> = {};

  if (!data.visionPrompt.prompt.trim()) {
    errors.prompt = "Please describe your vision for the store.";
  } else if (data.visionPrompt.prompt.trim().length < 20) {
    errors.prompt =
      "Please provide a more detailed description (at least 20 characters).";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates products step data.
 */
function validateProducts(_data: WizardData): StepValidationResult {
  const errors: Record<string, string> = {};

  // Products are optional for now and can generate without them.

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates review step (always valid if we reach it).
 */
function validateReview(_data: WizardData): StepValidationResult {
  return {
    isValid: true,
    errors: {},
  };
}

/**
 * Step validators mapped by index.
 */
const STEP_VALIDATORS: Array<(data: WizardData) => StepValidationResult> = [
  validateBrandInfo,
  validateColorStyle,
  validateVisionPrompt,
  validateProducts,
  validateReview,
];

/**
 * Props for WizardProvider component.
 */
interface WizardProviderProps {
  /** Child components. */
  children: ReactNode;
}

/**
 * WizardProvider component that manages wizard state and provides context.
 */
export function WizardProvider({ children }: WizardProviderProps) {
  // Initialize state for current step, wizard data, unsaved changes tracking, and loading state.
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<WizardData>(DEFAULT_WIZARD_DATA);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved progress from localStorage on mount.
  useEffect(() => {
    try {
      // Retrieve persisted wizard state from localStorage by key.
      const saved = localStorage.getItem(WIZARD_STORAGE_KEY);
      if (saved) {
        // Parse saved state and restore current step and data.
        const parsed: WizardPersistState = JSON.parse(saved);
        setCurrentStep(parsed.currentStep);
        setData(parsed.data);
      }
    } catch (error) {
      // If localStorage is corrupted, start again.
      console.warn("Failed to load wizard progress:", error);
    } finally {
      // Mark loading as complete after attempting to restore state.
      setIsLoading(false);
    }
  }, []);

  // Auto-save to localStorage when data changes.
  useEffect(() => {
    // Skip auto-save if still loading from localStorage.
    if (isLoading) return;

    const saveToStorage = () => {
      try {
        // Build state object with current step, data, and timestamp.
        const state: WizardPersistState = {
          currentStep,
          data,
          lastSavedAt: new Date().toISOString(),
        };
        // Persist state to localStorage and clear unsaved changes flag.
        localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(state));
        setHasUnsavedChanges(false);
      } catch (error) {
        console.warn("Failed to save wizard progress:", error);
      }
    };

    // Debounce save to avoid excessive writes to localStorage.
    const timeoutId = setTimeout(saveToStorage, 1000);
    return () => clearTimeout(timeoutId);
  }, [currentStep, data, isLoading]);

  // Calculate total steps count and get configuration for current step.
  const totalSteps = WIZARD_STEPS.length;
  const currentStepConfig = WIZARD_STEPS[currentStep];

  // Create memoized validator function that runs validator for given step index.
  const validateStep = useCallback(
    (stepIndex: number): StepValidationResult => {
      const validator = STEP_VALIDATORS[stepIndex];
      // Return valid result if no validator exists for step.
      if (!validator) {
        return { isValid: true, errors: {} };
      }
      // Run validator function against current data.
      return validator(data);
    },
    [data],
  );

  // Compute and memoize validation result for current step.
  const currentStepValidation = useMemo(
    () => validateStep(currentStep),
    [currentStep, validateStep],
  );

  // Extract validity status from current step validation result.
  const isCurrentStepValid = currentStepValidation.isValid;

  // Navigate to next step only if current step is valid and not at end.
  const nextStep = useCallback(() => {
    if (!isCurrentStepValid) return;
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isCurrentStepValid, currentStep, totalSteps]);

  // Navigate to previous step if not at beginning.
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Navigate to specific step by index with bounds validation.
  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSteps) {
        setCurrentStep(index);
      }
    },
    [totalSteps],
  );

  // Update nested wizard data for given step key and mark as unsaved.
  const updateData = useCallback(
    <K extends keyof WizardData>(
      stepKey: K,
      updates: Partial<WizardData[K]>,
    ) => {
      // Merge new updates with existing step data using shallow merge.
      setData((prev) => ({
        ...prev,
        [stepKey]: {
          ...prev[stepKey],
          ...updates,
        },
      }));
      // Flag that changes have not been persisted to localStorage.
      setHasUnsavedChanges(true);
    },
    [],
  );

  // Reset wizard to initial state and clear localStorage.
  const resetWizard = useCallback(() => {
    setCurrentStep(0);
    setData(DEFAULT_WIZARD_DATA);
    setHasUnsavedChanges(false);
    // Remove persisted state from localStorage to start fresh.
    localStorage.removeItem(WIZARD_STORAGE_KEY);
  }, []);

  // Manually save current progress to localStorage and clear unsaved flag.
  const saveProgress = useCallback(() => {
    try {
      // Build state object with current step, data, and timestamp.
      const state: WizardPersistState = {
        currentStep,
        data,
        lastSavedAt: new Date().toISOString(),
      };
      // Persist state to localStorage and mark all changes as saved.
      localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(state));
      setHasUnsavedChanges(false);
    } catch (error) {
      console.warn("Failed to save wizard progress:", error);
    }
  }, [currentStep, data]);

  // Clear persisted progress from localStorage and reset unsaved changes flag.
  const clearSavedProgress = useCallback(() => {
    localStorage.removeItem(WIZARD_STORAGE_KEY);
    setHasUnsavedChanges(false);
  }, []);

  // Aggregate all context values into single object for provider.
  const value: WizardContextValue = {
    currentStep,
    totalSteps,
    currentStepConfig,
    steps: WIZARD_STEPS,
    data,
    isCurrentStepValid,
    currentStepValidation,
    hasUnsavedChanges,
    isLoading,
    nextStep,
    prevStep,
    goToStep,
    updateData,
    resetWizard,
    saveProgress,
    clearSavedProgress,
    validateStep,
  };

  // Render provider with aggregated context value and child components.
  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}

/**
 * Hook to access wizard context.
 * Must be used within a WizardProvider.
 */
export function useWizard(): WizardContextValue {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}
