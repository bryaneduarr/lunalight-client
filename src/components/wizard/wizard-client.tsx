"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WizardProvider, useWizard } from "@/components/wizard/wizard-context";
import { WizardContainer } from "@/components/wizard/wizard-container";

/**
 * WizardClient wraps the wizard with provider and handles generation.
 */
export function WizardClient() {
  return (
    <WizardProvider>
      <WizardClientInner />
    </WizardProvider>
  );
}

/**
 * Inner component that uses wizard context.
 */
function WizardClientInner() {
  const router = useRouter();
  const { data, resetWizard } = useWizard();
  const [isGenerating, setIsGenerating] = useState(false);

  // Handles theme generation - to be implemented in Feature 7.
  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      // TODO: Implement actual AI generation.
      // For now, simulate generation and redirect to dashboard.
      console.log("Generating theme with data:", data);

      // Simulate API call delay.
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Reset wizard state after successful generation.
      resetWizard();

      // Redirect to dashboard (or editor in the future).
      router.push("/dashboard");
    } catch (error) {
      console.error("Theme generation failed:", error);
      // Error handling will be implemented in Feature 7.
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <WizardContainer onGenerate={handleGenerate} isGenerating={isGenerating} />
  );
}
