import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { ProtectedRoute } from "@/components/auth/protected-route";

/**
 * Props for the WizardLayout component.
 */
interface WizardLayoutProps {
  children: ReactNode;
}

/**
 * WizardLayout provides the layout structure for the theme creation wizard.
 *
 * Includes the header with navigation and user profile dropdown.
 * Protected route ensures only authenticated users can access.
 */
export default function WizardLayout({ children }: WizardLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <div className="flex-1">
        <ProtectedRoute>{children}</ProtectedRoute>
      </div>
    </div>
  );
}
