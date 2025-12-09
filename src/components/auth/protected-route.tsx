"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import tokenService from "@/services/token.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Props for the ProtectedRoute component.
 */
interface ProtectedRouteProps {
  /** The child components to render when authenticated. */
  children: ReactNode;
}

/**
 * ProtectedRoute guards routes that require authentication.
 *
 * Redirects unauthenticated users to the login page.
 * Shows a loading skeleton while the auth state is being determined.
 * Checks token validity on every navigation and refreshes if needed.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  // Local loading state for token refresh during navigation.
  const [isRefreshing] = useState(false);
  const refreshAttempted = useRef(false);

  // Check and refresh tokens on navigation.
  const checkAndRefreshTokens = useCallback(async () => {
    // Skip if already refreshing or auth is still loading.
    if (isRefreshing || authLoading) {
      return;
    }

    // Check auth status with server.
    const { hasAccessToken, hasRefreshToken } =
      await tokenService.syncFromServer();

    // If we have access token, no action needed.
    if (hasAccessToken) {
      refreshAttempted.current = false;
      return;
    }

    // If we have refresh token but no access token, try to refresh.
    if (hasRefreshToken && !refreshAttempted.current) {
      refreshAttempted.current = true;
      try {
        await tokenService.refreshAccessToken();
        // Refresh succeeded, tokens are updated.
        refreshAttempted.current = false;
        return;
      } catch {
        // Refresh failed, clear tokens and redirect.
        tokenService.clearTokens();
        router.replace("/login");
        return;
      }
    }

    // No tokens at all - redirect to login.
    if (!hasRefreshToken && !refreshAttempted.current) {
      refreshAttempted.current = true;
      tokenService.clearTokens();
      router.replace("/login");
    }
  }, [isRefreshing, authLoading, router]);

  // Check tokens on mount and pathname change (navigation).
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is intentionally included to trigger on navigation.
  useEffect(() => {
    // Reset refresh attempt flag on navigation.
    refreshAttempted.current = false;
    checkAndRefreshTokens();
  }, [pathname, checkAndRefreshTokens]);

  // Also redirect if auth state says not authenticated.
  useEffect(() => {
    const checkAuth = async () => {
      if (!authLoading && !isAuthenticated && !isRefreshing) {
        // Double-check with server before redirecting.
        const { hasAccessToken, hasRefreshToken } =
          await tokenService.syncFromServer();

        // Try to refresh if we have refresh token.
        if (!hasAccessToken && hasRefreshToken) {
          try {
            await tokenService.refreshAccessToken();
            // Refresh succeeded, don't redirect.
            return;
          } catch {
            // Refresh failed, proceed to redirect.
          }
        }

        // No tokens or refresh failed - redirect to login.
        if (!hasAccessToken) {
          router.replace("/login");
        }
      }
    };

    checkAuth();
  }, [authLoading, isAuthenticated, isRefreshing, router]);

  // Show loading skeleton while checking auth state or refreshing.
  if (authLoading || isRefreshing) {
    return <ProtectedRouteSkeleton />;
  }

  // Don't render children until authenticated.
  if (!isAuthenticated) {
    return <ProtectedRouteSkeleton />;
  }

  return <>{children}</>;
}

/**
 * Skeleton loading state for protected routes.
 */
function ProtectedRouteSkeleton() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      {/* Progress skeleton. */}
      <div className="border-b bg-background/95 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2 w-full" />
          <div className="hidden gap-2 md:flex">
            {["step-1", "step-2", "step-3", "step-4", "step-5"].map((key) => (
              <Skeleton key={key} className="h-20 flex-1" />
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton. */}
      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="border-0 shadow-none">
            <CardContent className="space-y-6 p-0">
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full max-w-md" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-24 w-full max-w-xl" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation skeleton. */}
      <div className="sticky bottom-0 border-t bg-background/95 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
}
