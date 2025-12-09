"use client";

import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useWizard } from "@/components/wizard/wizard-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Props for WizardNavigation component.
 */
interface WizardNavigationProps {
  /** Additional CSS classes. */
  className?: string;
}

/**
 * WizardNavigation provides back/next buttons and handles step navigation.
 * Disables next button if current step validation fails.
 * Note: This component is hidden on the review step since ReviewStep handles its own navigation.
 */
export function WizardNavigation({ className }: WizardNavigationProps) {
  const { currentStep, isCurrentStepValid, nextStep, prevStep, resetWizard } =
    useWizard();

  const isFirstStep = currentStep === 0;

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
          disabled={isFirstStep}
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
            className="gap-2 text-muted-foreground"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Start Over</span>
          </Button>
        )}
      </div>
      {/* Right side - Next button. */}
      <div className="flex items-center justify-end gap-2">
        {/* Validation hint when step is invalid. */}
        {!isCurrentStepValid && (
          <p className="mr-2 text-muted-foreground text-sm">
            Complete required fields to continue
          </p>
        )}
        <Button
          type="button"
          onClick={nextStep}
          disabled={!isCurrentStepValid}
          className="gap-2"
        >
          <span>Next</span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
