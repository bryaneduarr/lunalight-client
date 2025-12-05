"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

/**
 * Error boundary for the wizard page.
 */
export default function WizardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-8">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center p-6 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle
              className="size-8 text-destructive"
              aria-hidden="true"
            />
          </div>
          <h1 className="mb-2 font-semibold text-xl">Something went wrong</h1>
          <p className="mb-6 text-muted-foreground">
            We encountered an error while loading the wizard. Your progress has
            been saved locally and should be recovered when you try again.
          </p>
          {error.digest && (
            <p className="mb-4 font-mono text-muted-foreground text-xs">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={reset} className="gap-2">
              <RefreshCw className="size-4" aria-hidden="true" />
              Try Again
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link href="/dashboard">
                <Home className="size-4" aria-hidden="true" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
