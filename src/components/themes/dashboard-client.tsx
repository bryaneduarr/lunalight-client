"use client";

import { useCallback } from "react";
import type { ThemeListItem } from "@/types/themes.types";
import { DashboardHeader } from "@/components/themes/dashboard-header";
import { ThemeList } from "@/components/themes/theme-list";

/**
 * Props for the DashboardClient component.
 */
interface DashboardClientProps {
  /** Array of themes to display. */
  themes: ThemeListItem[];
  /** Whether the data is currently loading. */
  isLoading?: boolean;
}

/**
 * DashboardClient handles the client-side interactivity for the dashboard.
 * Manages theme actions like create, edit, delete, and duplicate.
 */
export function DashboardClient({
  themes,
  isLoading = false,
}: DashboardClientProps) {
  // Handles the create new theme action.
  const handleCreateNew = useCallback(() => {
    // TODO: Navigate to theme creation wizard or open modal.
    console.info("Create new theme clicked.");
  }, []);

  // Handles the edit theme action.
  const handleEdit = useCallback((themeId: number) => {
    // TODO: Navigate to the theme editor.
    console.info(`Edit theme ${themeId} clicked.`);
  }, []);

  // Handles the delete theme action.
  const handleDelete = useCallback(async (themeId: number) => {
    // TODO: Call API to delete theme and refresh the list.
    console.info(`Delete theme ${themeId} confirmed.`);
    // Simulate API call delay.
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }, []);

  // Handles the duplicate theme action.
  const handleDuplicate = useCallback((themeId: number) => {
    // TODO: Call API to duplicate theme.
    console.info(`Duplicate theme ${themeId} clicked.`);
  }, []);

  // Handles the view in Shopify action.
  const handleViewInShopify = useCallback((themeId: number) => {
    // TODO: Open Shopify theme preview in new tab.
    console.info(`View theme ${themeId} in Shopify clicked.`);
  }, []);

  return (
    <div className="space-y-8">
      <DashboardHeader
        themeCount={themes.length}
        onCreateNew={handleCreateNew}
      />

      <ThemeList
        themes={themes}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onViewInShopify={handleViewInShopify}
        onCreateNew={handleCreateNew}
      />
    </div>
  );
}
