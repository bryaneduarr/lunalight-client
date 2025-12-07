import type { Metadata } from "next";
import { AuthCallbackClient } from "@/components/auth/auth-callback-client";

/**
 * Metadata for the auth callback page.
 */
export const metadata: Metadata = {
  title: "Authenticating... | Lunalight",
  description: "Completing Shopify authentication.",
};

/**
 * Props for the auth callback page.
 */
interface AuthCallbackPageProps {
  searchParams: Promise<{
    shop?: string;
    success?: string;
    error?: string;
    error_description?: string;
  }>;
}

/**
 * AuthCallbackPage handles the OAuth callback from Shopify.
 *
 * Tokens are now set in HTTP-only cookies by the server.
 * This page only receives the shop domain and success/error flags.
 */
export default async function AuthCallbackPage({
  searchParams,
}: AuthCallbackPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
      <AuthCallbackClient
        shop={params.shop}
        success={params.success === "true"}
        error={params.error}
        errorDescription={params.error_description}
      />
    </main>
  );
}
