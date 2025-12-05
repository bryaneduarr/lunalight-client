import type { Metadata } from "next";
import { WizardClient } from "@/components/wizard/wizard-client";

/**
 * Metadata for the wizard page.
 */
export const metadata: Metadata = {
  title: "Create New Theme | Lunalight",
  description:
    "Create a new AI-generated Shopify theme. Customize your brand, colors, and vision to generate a unique store design.",
};

/**
 * WizardPage is the main page for the store generation wizard.
 */
export default function WizardPage() {
  return (
    <main>
      <WizardClient />
    </main>
  );
}
