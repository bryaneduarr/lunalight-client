import { Plus, Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Props for the EmptyState component.
 */
interface EmptyStateProps {
  /** Callback when the create new theme button is clicked. */
  onCreateNew?: () => void;
  /** Additional CSS classes for the container. */
  className?: string;
}

/**
 * EmptyState displays a friendly message when the user has no themes.
 * Includes a call-to-action to create a new theme.
 */
export function EmptyState({ onCreateNew, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-8 text-center",
        className,
      )}
    >
      {/* Icon Container. */}
      <div className="relative mb-6">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
          <Palette className="size-10 text-primary" aria-hidden="true" />
        </div>
        {/* Decorative sparkles. */}
        <Sparkles
          className="-top-1 -right-1 absolute size-6 text-amber-500"
          aria-hidden="true"
        />
      </div>

      {/* Heading. */}
      <h2 className="mb-2 font-semibold text-2xl tracking-tight">
        No themes yet
      </h2>

      {/* Description. */}
      <p className="mb-6 max-w-md text-muted-foreground">
        Get started by creating your first AI-generated theme. Describe your
        vision, and our AI will bring it to life as a complete Shopify store
        theme.
      </p>

      {/* Features List. */}
      <ul className="mb-8 flex flex-wrap justify-center gap-4 text-muted-foreground text-sm">
        <li className="flex items-center gap-2">
          <span
            className="size-1.5 rounded-full bg-primary"
            aria-hidden="true"
          />
          AI-powered generation
        </li>
        <li className="flex items-center gap-2">
          <span
            className="size-1.5 rounded-full bg-primary"
            aria-hidden="true"
          />
          Complete Liquid themes
        </li>
        <li className="flex items-center gap-2">
          <span
            className="size-1.5 rounded-full bg-primary"
            aria-hidden="true"
          />
          Easy customization
        </li>
      </ul>

      {/* Create Button. */}
      <Button size="lg" onClick={onCreateNew} className="gap-2">
        <Plus className="size-5" aria-hidden="true" />
        Create Your First Theme
      </Button>
    </div>
  );
}
