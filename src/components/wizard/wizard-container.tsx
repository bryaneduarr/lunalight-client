"use client";

import { useWizard } from "@/components/wizard/wizard-context";
import { WizardProgress } from "@/components/wizard/wizard-progress";
import { WizardNavigation } from "@/components/wizard/wizard-navigation";
import { BrandInfoStep } from "@/components/wizard/steps/brand-info-step";
import { ColorStyleStep } from "@/components/wizard/steps/color-style-step";
import { VisionPromptStep } from "@/components/wizard/steps/vision-prompt-step";
import { ProductsStep } from "@/components/wizard/steps/products-step";
import { ReviewStep } from "@/components/wizard/steps/review-step";

/**
 * Props for WizardContainer component.
 */
interface WizardContainerProps {
  /** Callback when the user triggers theme generation from review step. */
  onGenerate?: () => void;
  /** Whether theme generation is in progress. */
  isGenerating?: boolean;
}

/**
 * WizardContainer manages the wizard UI, rendering the current step and navigation.
 */
export function WizardContainer({
  onGenerate,
  isGenerating = false,
}: WizardContainerProps) {
  const { currentStep } = useWizard();

  // Render the current step component.
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <BrandInfoStep />;
      case 1:
        return <ColorStyleStep />;
      case 2:
        return <VisionPromptStep />;
      case 3:
        return <ProductsStep />;
      case 4:
        return <ReviewStep />;
      default:
        return <BrandInfoStep />;
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      {/* Progress indicator. */}
      <div className="border-b bg-background/95 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <WizardProgress />
        </div>
      </div>

      {/* Step content. */}
      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-4xl">{renderCurrentStep()}</div>
      </div>

      {/* Navigation footer. */}
      <div className="sticky bottom-0 border-t bg-background/95 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <WizardNavigation
            onGenerate={onGenerate}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </div>
  );
}
