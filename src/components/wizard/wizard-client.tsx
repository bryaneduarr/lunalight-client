"use client";

import { WizardProvider } from "@/components/wizard/wizard-context";
import { WizardContainer } from "@/components/wizard/wizard-container";

/**
 * WizardClient wraps the wizard with provider.
 * Theme generation is handled by ReviewStep component.
 */
export function WizardClient() {
  return (
    <WizardProvider>
      <WizardContainer />
    </WizardProvider>
  );
}
