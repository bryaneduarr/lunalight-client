"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Palette,
  LogOut,
  Store,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * Extracts store name from a shop domain.
 *
 * @param shopDomain - The full shop domain (e.g., "mystore.myshopify.com").
 * @returns The store name part (e.g., "mystore").
 */
function getStoreName(shopDomain: string): string {
  return shopDomain.replace(".myshopify.com", "");
}

/**
 * Generates initials from a store name.
 *
 * @param storeName - The store name.
 * @returns The first two characters uppercased.
 */
function getStoreInitials(storeName: string): string {
  const cleaned = storeName.replace(/-/g, " ").trim();
  const words = cleaned.split(" ").filter(Boolean);

  if (words.length >= 2) {
    return `${words[0]?.charAt(0) ?? ""}${words[1]?.charAt(0) ?? ""}`.toUpperCase();
  }

  return cleaned.slice(0, 2).toUpperCase();
}

/**
 * Header component with navigation and user profile dropdown.
 *
 * Displays the app logo, navigation links, and a user profile dropdown
 * showing the authenticated store name with logout functionality.
 */
export function Header() {
  const router = useRouter();
  const { isAuthenticated, shopDomain, logout } = useAuth();

  const storeName = shopDomain ? getStoreName(shopDomain) : null;
  const storeInitials = storeName ? getStoreInitials(storeName) : "??";

  // Handles user logout.
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-border/40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and brand. */}
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Palette className="size-4 text-primary" aria-hidden="true" />
          </div>
          <span className="font-semibold text-lg">Lunalight</span>
        </Link>

        {/* Right side - User profile or login button. */}
        <div className="flex items-center gap-4">
          {isAuthenticated && storeName ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2"
                  aria-label={`Store menu for ${storeName}`}
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 font-medium text-primary text-sm">
                      {storeInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[150px] truncate font-medium text-sm sm:inline-block">
                    {storeName}
                  </span>
                  <ChevronDown
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="font-medium text-sm">Connected Store</p>
                    <p className="truncate text-muted-foreground text-xs">
                      {shopDomain}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex cursor-pointer gap-2">
                    <LayoutDashboard className="size-4" aria-hidden="true" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href={`https://${shopDomain}/admin`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex cursor-pointer gap-2"
                  >
                    <Store className="size-4" aria-hidden="true" />
                    Shopify Admin
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 size-4" aria-hidden="true" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/login">Connect Store</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
