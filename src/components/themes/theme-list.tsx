import type { ThemeListItem } from "@/types/themes.types";
import { ThemeCard, ThemeCardSkeleton } from "@/components/themes/theme-card";
import { EmptyState } from "@/components/themes/empty-state";
import { cn } from "@/lib/utils";

/**
 * Props for the ThemeList component.
 */
interface ThemeListProps {
  /** Array of themes to display. */
  themes: ThemeListItem[];
  /** Whether the data is currently loading. */
  isLoading?: boolean;
  /** Callback when a theme edit is requested. */
  onEdit?: (themeId: number) => void;
  /** Callback when a theme delete is requested. */
  onDelete?: (themeId: number) => void;
  /** Callback when a theme duplicate is requested. */
  onDuplicate?: (themeId: number) => void;
  /** Callback when view in Shopify is requested. */
  onViewInShopify?: (themeId: number) => void;
  /** Callback when create new theme is requested. */
  onCreateNew?: () => void;
  /** Additional CSS classes for the container. */
  className?: string;
}

/**
 * ThemeList displays a responsive grid of theme cards.
 * Shows empty state when no themes exist, or skeleton loaders while loading.
 */
export function ThemeList({
  themes,
  isLoading = false,
  onEdit,
  onDelete,
  onDuplicate,
  onViewInShopify,
  onCreateNew,
  className,
}: ThemeListProps) {
  // Show skeleton loading state.
  if (isLoading) {
    return (
      <ul
        className={cn(
          "grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          className,
        )}
        aria-busy="true"
        aria-label="Loading themes"
      >
        <li>
          <ThemeCardSkeleton />
        </li>
        <li>
          <ThemeCardSkeleton />
        </li>
        <li>
          <ThemeCardSkeleton />
        </li>
        <li>
          <ThemeCardSkeleton />
        </li>
      </ul>
    );
  }

  // Show empty state when no themes exist.
  if (themes.length === 0) {
    return <EmptyState onCreateNew={onCreateNew} className={className} />;
  }

  // Show the theme grid.
  return (
    <ul
      className={cn(
        "grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
      aria-label="Your themes"
    >
      {themes.map((theme) => (
        <li key={theme.id}>
          <ThemeCard
            theme={theme}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onViewInShopify={onViewInShopify}
          />
        </li>
      ))}
    </ul>
  );
}
