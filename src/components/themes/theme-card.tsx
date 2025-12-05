"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  ExternalLink,
  Copy,
  Palette,
} from "lucide-react";
import type { ThemeListItem } from "@/types/themes.types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteThemeModal } from "@/components/themes/delete-theme-modal";

/**
 * Props for the ThemeCard component.
 */
interface ThemeCardProps {
  /** The theme data to display. */
  theme: ThemeListItem;
  /** Callback when the edit button is clicked. */
  onEdit?: (themeId: number) => void;
  /** Callback when the delete action is confirmed. */
  onDelete?: (themeId: number) => void;
  /** Callback when the duplicate action is clicked. */
  onDuplicate?: (themeId: number) => void;
  /** Callback when the view in Shopify action is clicked. */
  onViewInShopify?: (themeId: number) => void;
  /** Additional CSS classes for the card. */
  className?: string;
}

/**
 * Formats a date string to a human-readable format.
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Returns the relative time from now.
 */
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return formatDate(dateString);
}

/**
 * ThemeCard displays a single theme with its preview, status, and action buttons.
 * Supports edit, delete, duplicate, and view in Shopify actions.
 */
export function ThemeCard({
  theme,
  onEdit,
  onDelete,
  onDuplicate,
  onViewInShopify,
  className,
}: ThemeCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handles the delete confirmation action.
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete?.(theme.id);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <Card
        className={cn(
          "group relative overflow-hidden transition-all hover:shadow-md",
          className,
        )}
      >
        {/* Theme Preview Area. */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
          {theme.previewUrl ? (
            <Image
              src={theme.previewUrl}
              alt={`Preview of ${theme.name} theme.`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ) : (
            // Placeholder when no preview is available.
            <div className="flex size-full items-center justify-center bg-linear-to-br from-muted to-muted-foreground/10">
              <Palette
                className="size-12 text-muted-foreground/30"
                aria-hidden="true"
              />
            </div>
          )}
          {/* Status Badge Overlay. */}
          <div className="absolute top-3 left-3">
            <Badge
              variant={theme.status === "published" ? "default" : "secondary"}
              className={cn(
                "font-medium capitalize",
                theme.status === "published" &&
                  "bg-green-600 hover:bg-green-700",
              )}
            >
              {theme.status}
            </Badge>
          </div>
          {/* Actions Dropdown. */}
          <div className="absolute top-3 right-3 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="size-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                  aria-label={`Actions for ${theme.name}`}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => onEdit?.(theme.id)}
                  className="cursor-pointer"
                >
                  <Edit2 className="mr-2 size-4" />
                  Edit Theme
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDuplicate?.(theme.id)}
                  className="cursor-pointer"
                >
                  <Copy className="mr-2 size-4" />
                  Duplicate
                </DropdownMenuItem>
                {theme.status === "published" && (
                  <DropdownMenuItem
                    onClick={() => onViewInShopify?.(theme.id)}
                    className="cursor-pointer"
                  >
                    <ExternalLink className="mr-2 size-4" />
                    View in Shopify
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-1 text-lg">{theme.name}</CardTitle>
          <CardDescription>
            Updated {getRelativeTime(theme.updatedAt)}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-4">
          <p className="text-muted-foreground text-sm">
            Created {formatDate(theme.createdAt)}
          </p>
        </CardContent>
        <CardFooter className="gap-2 border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit?.(theme.id)}
          >
            <Edit2 className="mr-2 size-4" />
            Edit
          </Button>
          {theme.status === "published" && (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => onViewInShopify?.(theme.id)}
            >
              <ExternalLink className="mr-2 size-4" />
              View
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Delete Confirmation Modal. */}
      <DeleteThemeModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        themeName={theme.name}
        isDeleting={isDeleting}
      />
    </>
  );
}

/**
 * ThemeCardSkeleton displays a loading placeholder for a theme card.
 * Matches the layout and sizing of the ThemeCard component.
 */
export function ThemeCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Preview skeleton. */}
      <Skeleton className="aspect-16/10 w-full rounded-none" />

      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>

      <CardContent className="pb-4">
        <Skeleton className="h-4 w-2/3" />
      </CardContent>

      <CardFooter className="gap-2 border-t pt-4">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </CardFooter>
    </Card>
  );
}
