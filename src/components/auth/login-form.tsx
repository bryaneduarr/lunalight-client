"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, ArrowRight, Loader2, AlertCircle, Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  isValidShopDomain,
  sanitizeShopDomain,
  initiateOAuth,
} from "@/services/auth.service";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * LoginForm component for Shopify OAuth authentication.
 *
 * Allows users to enter their Shopify store domain and initiates
 * the OAuth flow to connect their store to Lunalight.
 */
export function LoginForm() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [shopDomain, setShopDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to dashboard if already authenticated.
  if (authLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (isAuthenticated) {
    router.replace("/dashboard");
    return null;
  }

  // Handles form submission and initiates OAuth flow.
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // Validate shop domain.
    if (!shopDomain.trim()) {
      setError("Please enter your Shopify store domain.");
      return;
    }

    const sanitized = sanitizeShopDomain(shopDomain);

    if (!isValidShopDomain(sanitized)) {
      setError(
        "Invalid store domain. Please enter a valid Shopify store domain (e.g., mystore.myshopify.com).",
      );
      return;
    }

    setIsLoading(true);

    // Initiate OAuth flow - this will redirect the browser.
    initiateOAuth(sanitized);
  };

  // Handles input change and clears error.
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShopDomain(event.target.value);
    if (error) {
      setError(null);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        {/* Logo. */}
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <Palette className="size-8 text-primary" aria-hidden="true" />
        </div>

        <CardTitle className="font-bold text-2xl">Connect Your Store</CardTitle>
        <CardDescription>
          Enter your Shopify store domain to get started with Lunalight.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error message. */}
          {error && (
            <div
              className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm"
              role="alert"
            >
              <AlertCircle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>{error}</span>
            </div>
          )}

          {/* Shop domain input. */}
          <div className="space-y-2">
            <Label htmlFor="shop-domain">Store Domain</Label>
            <div className="relative">
              <Store
                className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="shop-domain"
                type="text"
                placeholder="mystore.myshopify.com"
                value={shopDomain}
                onChange={handleInputChange}
                className="pl-10"
                disabled={isLoading}
                autoComplete="off"
                autoFocus
                aria-describedby="shop-domain-hint"
                aria-invalid={error ? "true" : "false"}
              />
            </div>
            <p id="shop-domain-hint" className="text-muted-foreground text-xs">
              Enter your store name or full domain (e.g., mystore or
              mystore.myshopify.com).
            </p>
          </div>

          {/* Submit button. */}
          <Button type="submit" className="w-full gap-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Connecting...
              </>
            ) : (
              <>
                Connect with Shopify
                <ArrowRight className="size-4" aria-hidden="true" />
              </>
            )}
          </Button>
        </form>

        {/* Help text. */}
        <div className="mt-6 border-muted border-t pt-4 text-center">
          <p className="text-muted-foreground text-xs">
            By connecting, you authorize Lunalight to access your Shopify store
            data to generate and manage themes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
