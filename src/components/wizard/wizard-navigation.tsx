"use client";

import { ChevronLeft, ChevronRight, Sparkles, RotateCcw } from "lucide-react";
import { useWizard } from "@/components/wizard/wizard-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Props for WizardNavigation component.
 */
interface WizardNavigationProps {
  /** Callback when generation is triggered from review step. */
  onGenerate?: () => void;
  /** Whether generation is in progress. */
  isGenerating?: boolean;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * WizardNavigation provides back/next buttons and handles step navigation.
 * Disables next button if current step validation fails.
 */
export function WizardNavigation({
  onGenerate,
  isGenerating = false,
  className,
}: WizardNavigationProps) {
  const {
    currentStep,
    totalSteps,
    isCurrentStepValid,
    nextStep,
    prevStep,
    resetWizard,
  } = useWizard();

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // Handles next button click.
  const handleNext = () => {
    if (isLastStep && onGenerate) {
      onGenerate();
    } else {
      nextStep();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-t bg-background pt-6 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {/* Left side - Back button and Reset. */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={isFirstStep || isGenerating}
          className="gap-2"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        {/* Reset button - visible on first step. */}
        {isFirstStep && (
          <Button
            type="button"
            variant="ghost"
            onClick={resetWizard}
            disabled={isGenerating}
            className="gap-2 text-muted-foreground"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Start Over</span>
          </Button>
        )}
      </div>
      {/* Right side - Next/Generate button. */}
      <div className="flex items-center justify-end gap-2">
        {/* Validation hint when step is invalid. */}
        {!isCurrentStepValid && !isLastStep && (
          <p className="mr-2 text-muted-foreground text-sm">
            Complete required fields to continue
          </p>
        )}
        <Button
          type="button"
          onClick={handleNext}
          disabled={!isCurrentStepValid || isGenerating}
          className={cn("gap-2", isLastStep && "bg-primary")}
        >
          {isGenerating ? (
            <>
              <span className="animate-spin">
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
              <span>Generating...</span>
            </>
          ) : isLastStep ? (
            <>
              <Sparkles className="size-4" aria-hidden="true" />
              <span>Generate Theme</span>
            </>
          ) : (
            <>
              <span>Next</span>
              <ChevronRight className="size-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
