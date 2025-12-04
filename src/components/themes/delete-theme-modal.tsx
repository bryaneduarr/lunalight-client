"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Props for the DeleteThemeModal component.
 */
interface DeleteThemeModalProps {
  /** Whether the modal is currently open. */
  isOpen: boolean;
  /** Callback when the modal is closed. */
  onClose: () => void;
  /** Callback when the delete action is confirmed. */
  onConfirm: () => void | Promise<void>;
  /** The name of the theme being deleted. */
  themeName: string;
  /** Whether the delete action is in progress. */
  isDeleting?: boolean;
}

/**
 * DeleteThemeModal displays a confirmation dialog before deleting a theme.
 * Uses Radix UI AlertDialog for accessibility compliance.
 */
export function DeleteThemeModal({
  isOpen,
  onClose,
  onConfirm,
  themeName,
  isDeleting = false,
}: DeleteThemeModalProps) {
  // Handles the open state change.
  const handleOpenChange = (open: boolean) => {
    if (!open && !isDeleting) {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle
              className="size-6 text-destructive"
              aria-hidden="true"
            />
          </div>
          <AlertDialogTitle className="text-center">
            Delete Theme
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{themeName}</span>?
            This action cannot be undone and will permanently remove the theme
            and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className={cn(
              buttonVariants({ variant: "destructive" }),
              "min-w-[100px]",
            )}
          >
            {isDeleting ? (
              <>
                <Loader2
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
                Deleting...
              </>
            ) : (
              "Delete Theme"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
