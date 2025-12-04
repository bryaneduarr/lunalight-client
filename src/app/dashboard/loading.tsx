import { Palette } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeCardSkeleton } from "@/components/themes/theme-card";

/**
 * Loading state for the dashboard page.
 * Displays skeleton placeholders while data is being fetched.
 */
export default function DashboardLoading() {
  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Header skeleton. */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Palette className="size-5 text-primary" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-7 w-36" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
          <Separator />
        </div>
        {/* Theme cards skeleton grid. */}
        <ul
          className="grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
      </div>
    </main>
  );
}
