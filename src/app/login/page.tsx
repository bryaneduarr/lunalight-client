import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

/**
 * Metadata for the login page.
 */
export const metadata: Metadata = {
  title: "Login | Lunalight",
  description:
    "Connect your Shopify store to Lunalight and start creating AI-powered themes.",
};

/**
 * LoginPage handles Shopify OAuth authentication.
 *
 * Displays a form for users to enter their Shopify store domain
 * and initiates the OAuth flow with Shopify.
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
      <LoginForm />
    </main>
  );
}
