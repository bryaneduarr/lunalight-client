import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for the wizard page.
 */
export default function WizardLoading() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      {/* Progress skeleton. */}
      <div className="border-b bg-background px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
      </div>

      {/* Content skeleton. */}
      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-24 w-full max-w-xl" />
          </div>
        </div>
      </div>

      {/* Navigation skeleton. */}
      <div className="sticky bottom-0 border-t bg-background px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
}
