import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { ProtectedRoute } from "@/components/auth/protected-route";

/**
 * Props for the DashboardLayout component.
 */
interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * DashboardLayout provides the layout structure for authenticated pages.
 *
 * Includes the header with navigation and user profile dropdown.
 * Protected route ensures only authenticated users can access.
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <div className="flex-1">
        <ProtectedRoute>{children}</ProtectedRoute>
      </div>
    </div>
  );
}
