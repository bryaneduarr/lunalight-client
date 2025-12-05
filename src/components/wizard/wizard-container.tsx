"use client";

import { useWizard } from "@/components/wizard/wizard-context";
import { WizardProgress } from "@/components/wizard/wizard-progress";
import { WizardNavigation } from "@/components/wizard/wizard-navigation";
import { BrandInfoStep } from "@/components/wizard/steps/brand-info-step";
import { ColorStyleStep } from "@/components/wizard/steps/color-style-step";
import { VisionPromptStep } from "@/components/wizard/steps/vision-prompt-step";
import { ProductsStep } from "@/components/wizard/steps/products-step";
import { ReviewStep } from "@/components/wizard/steps/review-step";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

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
  const { currentStep, isLoading } = useWizard();

  // Show loading skeleton while loading from localStorage.
  if (isLoading) {
    return <WizardSkeleton />;
  }

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

/**
 * WizardSkeleton displays a loading placeholder while wizard state is loading.
 */
function WizardSkeleton() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      {/* Progress skeleton. */}
      <div className="border-b bg-background/95 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2 w-full" />
          <div className="hidden gap-2 md:flex">
            {["step-1", "step-2", "step-3", "step-4", "step-5"].map((key) => (
              <Skeleton key={key} className="h-20 flex-1" />
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton. */}
      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="border-0 shadow-none">
            <CardContent className="space-y-6 p-0">
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full max-w-md" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-24 w-full max-w-xl" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation skeleton. */}
      <div className="sticky bottom-0 border-t bg-background/95 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
}
