"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";

/**
 * Props for the TanStack Query provider component.
 */
interface QueryProviderProps {
  /** Child components to render within the provider. */
  children: React.ReactNode;
}

/**
 * QueryProvider wraps the application with TanStack Query's QueryClientProvider.
 *
 * This provider must be used at the root of the application to enable
 * TanStack Query hooks throughout the component tree.
 *
 * @param props - Component props containing children.
 * @returns The QueryClientProvider wrapper.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // NOTE: We will Avoid useState when initializing the query client
  // if suspense boundary between this and the code that may
  // suspend because React will throw away the client on the initial
  // render if it suspends and there is no boundary.
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
