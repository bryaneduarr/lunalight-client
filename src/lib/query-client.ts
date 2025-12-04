import { QueryClient, isServer } from "@tanstack/react-query";

/**
 * Creates a new QueryClient with default options optimized for SSR.
 *
 * @returns A configured QueryClient instance.
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we set some default staleTime to avoid refetching
        // immediately on the client.
        staleTime: 60 * 1000, // 1 minute.
        // Retry failed requests up to 3 times with exponential backoff.
        retry: 3,
        // Refetch on window focus for fresh data.
        refetchOnWindowFocus: true,
        // Keep cached data in memory for 5 minutes after becoming unused.
        gcTime: 5 * 60 * 1000,
      },
      mutations: {
        // Retry mutations once on failure.
        retry: 1,
      },
    },
  });
}

/** Browser-side query client singleton. */
let browserQueryClient: QueryClient | undefined;

/**
 * Gets the appropriate QueryClient for the current environment.
 *
 * - Server: Always creates a new QueryClient to prevent data leaking between requests.
 * - Browser: Reuses a singleton QueryClient to maintain cache across navigation.
 *
 * @returns The QueryClient instance for the current environment.
 */
export function getQueryClient(): QueryClient {
  if (isServer) {
    // Server: always make a new query client.
    return makeQueryClient();
  }
  // Browser makes a new query client if it doesn't have already one.
  // This is very important, so it doesn't re-make a new client if React
  // suspends during the initial render.
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

/** Query key factory for themes. */
export const themeKeys = {
  /** Base key for all theme-related queries. */
  all: ["themes"] as const,

  /** Key for theme list queries. */
  lists: () => [...themeKeys.all, "list"] as const,

  /** Key for filtered theme list queries. */
  list: (filters?: unknown) => [...themeKeys.lists(), filters ?? {}] as const,

  /** Key for single theme queries. */
  details: () => [...themeKeys.all, "detail"] as const,

  /** Key for a specific theme by ID. */
  detail: (id: number) => [...themeKeys.details(), id] as const,
} as const;

/** Query key factory for drafts. */
export const draftKeys = {
  /** Base key for all draft-related queries. */
  all: ["drafts"] as const,

  /** Key for draft detail queries. */
  details: () => [...draftKeys.all, "detail"] as const,

  /** Key for a specific draft by theme ID. */
  detail: (themeId: number) => [...draftKeys.details(), themeId] as const,
} as const;
