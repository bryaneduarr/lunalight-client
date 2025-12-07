"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * Props for the AuthCallbackClient component.
 */
interface AuthCallbackClientProps {
  /** The shop domain from the callback. */
  shop?: string;
  /** Success flag from the server redirect. */
  success?: boolean;
  /** Error code if authentication failed. */
  error?: string;
  /** Error description if authentication failed. */
  errorDescription?: string;
}

/**
 * AuthCallbackClient handles the client-side OAuth callback processing.
 *
 * Tokens are now in HTTP-only cookies set by the server.
 * This component reads cookies and initializes the auth state.
 */
export function AuthCallbackClient({
  shop,
  success,
  error,
  errorDescription,
}: AuthCallbackClientProps) {
  const router = useRouter();
  const { recheckAuth } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    error ? "error" : "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorDescription ?? error ?? null,
  );

  useEffect(() => {
    // If there's an error, don't proceed.
    if (error) {
      setStatus("error");
      return;
    }

    // If no success flag, something went wrong.
    if (!success) {
      setStatus("error");
      setErrorMessage("Authentication was not successful. Please try again.");
      return;
    }

    // If no shop domain, something went wrong.
    if (!shop) {
      setStatus("error");
      setErrorMessage("No shop domain received. Please try connecting again.");
      return;
    }

    // Process the callback by checking cookies.
    const processCallback = async () => {
      try {
        // Recheck auth to read cookies set by the server.
        // This will initialize the auth context from HTTP-only cookies.
        await recheckAuth();

        setStatus("success");

        // Redirect to dashboard after a short delay.
        setTimeout(() => {
          router.replace("/dashboard");
        }, 1500);
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "An error occurred during authentication.",
        );
      }
    };

    processCallback();
  }, [shop, success, error, recheckAuth, router]);

  // Loading state.
  if (status === "loading") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
          <CardTitle className="text-xl">Connecting Your Store</CardTitle>
          <CardDescription>
            Please wait while we complete the authentication...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Success state.
  if (status === "success") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="size-8 text-green-500" />
          </div>
          <CardTitle className="text-xl">Successfully Connected!</CardTitle>
          <CardDescription>
            Your store <strong>{shop}</strong> has been connected to Lunalight.
            Redirecting to your dashboard...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Button asChild variant="ghost" className="gap-2">
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state.
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="size-8 text-destructive" />
        </div>
        <CardTitle className="text-xl">Connection Failed</CardTitle>
        <CardDescription className="text-destructive">
          {errorMessage ?? "An error occurred while connecting your store."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/login">Try Again</Link>
          </Button>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
