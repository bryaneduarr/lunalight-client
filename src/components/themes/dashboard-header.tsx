import { Plus, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * Props for the DashboardHeader component.
 */
interface DashboardHeaderProps {
  /** The number of themes the user has. */
  themeCount?: number;
  /** Callback when the create new theme button is clicked. */
  onCreateNew?: () => void;
  /** Additional CSS classes for the container. */
  className?: string;
}

/**
 * DashboardHeader displays the page title, theme count, and create button.
 * Provides the main header UI for the theme dashboard.
 */
export function DashboardHeader({
  themeCount = 0,
  onCreateNew,
  className,
}: DashboardHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left section: Title and count. */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Palette className="size-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-bold text-2xl tracking-tight">Your Themes</h1>
            <p className="text-muted-foreground text-sm">
              {themeCount === 0
                ? "Create your first theme to get started."
                : themeCount === 1
                  ? "1 theme"
                  : `${themeCount} themes`}
            </p>
          </div>
        </div>

        {/* Right section: Create button. */}
        <Button onClick={onCreateNew} className="gap-2">
          <Plus className="size-4" aria-hidden="true" />
          <span>New Theme</span>
        </Button>
      </div>

      <Separator />
    </div>
  );
}
