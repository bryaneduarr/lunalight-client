"use client";

import { Check } from "lucide-react";
import { useWizard } from "@/components/wizard/wizard-context";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

/**
 * WizardProgress displays the current progress through the wizard steps.
 * Shows a progress bar and step indicators with completion status.
 */
export function WizardProgress() {
  const { currentStep, totalSteps, steps, validateStep, goToStep } =
    useWizard();

  // Calculate progress percentage.
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full space-y-4">
      {/* Progress bar. */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-muted-foreground">
            {Math.round(progressPercent)}% complete
          </span>
        </div>
        <Progress
          value={progressPercent}
          className="h-2"
          aria-label={`Wizard progress: ${currentStep + 1} of ${totalSteps} steps complete.`}
        />
      </div>
      {/* Step indicators - hidden on mobile, visible on larger screens. */}
      <nav aria-label="Wizard steps" className="hidden md:block">
        <ol className="flex items-center justify-between gap-2">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isAccessible = index <= currentStep;
            const validation = validateStep(index);
            const isValid = validation.isValid;

            return (
              <li key={step.id} className="flex flex-1 items-center">
                <button
                  type="button"
                  onClick={() => isAccessible && goToStep(index)}
                  disabled={!isAccessible}
                  className={cn(
                    "group flex w-full flex-col items-center gap-2 rounded-lg p-2 transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isAccessible && "cursor-pointer hover:bg-accent/50",
                    !isAccessible && "cursor-not-allowed opacity-50",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`${step.title}${isCompleted ? " (completed)" : isCurrent ? " (current)" : ""}`}
                >
                  {/* Step circle indicator. */}
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full border-2 font-medium text-sm transition-colors",
                      isCompleted && isValid
                        ? "border-primary bg-primary text-primary-foreground"
                        : isCurrent
                          ? "border-primary bg-background text-primary"
                          : "border-muted bg-background text-muted-foreground",
                    )}
                  >
                    {isCompleted && isValid ? (
                      <Check className="size-5" aria-hidden="true" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  {/* Step title. */}
                  <div className="text-center">
                    <span
                      className={cn(
                        "block font-medium text-sm transition-colors",
                        isCurrent
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    >
                      {step.title}
                    </span>
                    <span className="hidden text-muted-foreground text-xs lg:block">
                      {step.description}
                    </span>
                  </div>
                </button>
                {/* Connector line between steps. */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "hidden h-0.5 w-8 flex-shrink-0 lg:block",
                      index < currentStep ? "bg-primary" : "bg-muted",
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      {/* Mobile step indicator - shows current step title. */}
      <div className="md:hidden">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-sm">
            {currentStep + 1}
          </div>
          <div>
            <p className="font-medium text-foreground">
              {steps[currentStep].title}
            </p>
            <p className="text-muted-foreground text-sm">
              {steps[currentStep].description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
