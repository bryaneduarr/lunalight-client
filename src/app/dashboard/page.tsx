import type { Metadata } from "next";
import { DashboardClient } from "@/components/themes/dashboard-client";

/**
 * Metadata for the dashboard page.
 */
export const metadata: Metadata = {
  title: "Dashboard | Your Themes",
  description:
    "Manage your AI-generated Shopify themes. Create, edit, and publish themes with ease.",
};

/**
 * Mock data for development purposes.
 */
const MOCK_THEMES = [
  {
    id: 1,
    name: "Modern Minimalist Store",
    status: "published" as const,
    previewUrl: null,
    createdAt: "2024-01-15T10:30:00.000Z",
    updatedAt: "2024-01-20T14:45:00.000Z",
  },
  {
    id: 2,
    name: "Bold & Vibrant",
    status: "draft" as const,
    previewUrl: null,
    createdAt: "2024-01-18T09:00:00.000Z",
    updatedAt: "2024-01-18T09:00:00.000Z",
  },
  {
    id: 3,
    name: "Elegant Fashion",
    status: "published" as const,
    previewUrl: null,
    createdAt: "2024-01-10T16:20:00.000Z",
    updatedAt: "2024-01-19T11:30:00.000Z",
  },
];

/**
 * DashboardPage is the main page for theme management.
 * Displays a list of themes with options to create, edit, and delete.
 */
export default function DashboardPage() {
  // For now, we use mock data to demonstrate the UI.
  const themes = MOCK_THEMES;

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DashboardClient themes={themes} />
    </main>
  );
}
