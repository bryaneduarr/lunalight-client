"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { logout as logoutService } from "@/services/auth.service";
import tokenService from "@/services/token.service";
import { setAuthRedirectCallback } from "@/services/authenticated-fetch";

/**
 * Authentication state interface.
 */
interface AuthState {
  /** Whether the auth state is still being loaded. */
  isLoading: boolean;
  /** Whether the user is authenticated. */
  isAuthenticated: boolean;
  /** The authenticated shop domain. */
  shopDomain: string | null;
}

/**
 * Authentication context interface.
 */
interface AuthContextType extends AuthState {
  /** Sets the authentication data after successful OAuth. */
  setAuth: (
    shopDomain: string,
    accessToken: string,
    refreshToken: string,
  ) => void;
  /** Logs out the user and clears authentication data. */
  logout: () => Promise<void>;
  /** Gets a valid access token, refreshing if necessary. */
  getAccessToken: () => Promise<string | null>;
  /** Re-checks authentication state from cookies. */
  recheckAuth: () => void;
}

// Create the context with a default value.
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Props for the AuthProvider component.
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider manages the authentication state across the application.
 *
 * Provides authentication context to all child components, handling:
 * - Managing authentication state with JWT tokens.
 * - Automatic token refresh on expiration.
 * - Proactive refresh when only refresh token exists.
 * - Detecting invalid states (access token only, no refresh token).
 * - Updating authentication state after OAuth.
 * - Logging out and clearing authentication data.
 * - Persisting auth state across page refreshes via cookies.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();

  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    shopDomain: null,
  });

  // Set up auth redirect callback for authenticated fetch.
  useEffect(() => {
    setAuthRedirectCallback(() => {
      // Clear state and redirect to login.
      tokenService.clearTokens();
      setState({
        isLoading: false,
        isAuthenticated: false,
        shopDomain: null,
      });
      router.push("/login");
    });
  }, [router]);

  // Initialize auth state from server on mount and subscribe to changes.
  useEffect(() => {
    let isMounted = true;

    // Initialize auth state by checking with server.
    const initAuth = async () => {
      const result = await tokenService.initFromServer();

      if (!isMounted) return;

      // Update state based on server response.
      if (result.hasAccessToken) {
        setState({
          isLoading: false,
          isAuthenticated: true,
          shopDomain: result.shopDomain,
        });
      } else {
        setState({
          isLoading: false,
          isAuthenticated: false,
          shopDomain: null,
        });
      }
    };

    // Subscribe to token changes.
    const unsubscribe = tokenService.addTokenChangeListener((tokens) => {
      // Only set authenticated when access token exists (source of truth).
      if (!tokens.accessToken && !tokens.refreshToken) {
        // No tokens at all - unauthenticated.
        setState({
          isLoading: false,
          isAuthenticated: false,
          shopDomain: null,
        });
      } else if (tokens.accessToken) {
        // Access token exists - authenticated.
        setState({
          isLoading: false,
          isAuthenticated: true,
          shopDomain: tokens.shopDomain,
        });
      }
    });

    // Start initialization.
    initAuth();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Sets the authentication data after successful OAuth.
  const setAuth = useCallback(
    (shopDomain: string, accessToken: string, refreshToken: string) => {
      // Store tokens in token service (also sets cookies).
      tokenService.setTokens(accessToken, refreshToken, shopDomain);

      setState({
        isLoading: false,
        isAuthenticated: true,
        shopDomain,
      });
    },
    [],
  );

  // Gets a valid access token, refreshing if necessary.
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      return await tokenService.getValidAccessToken();
    } catch {
      return null;
    }
  }, []);

  // Re-checks authentication state from server.
  const recheckAuth = useCallback(async () => {
    const result = await tokenService.initFromServer();

    if (result.hasAccessToken) {
      // Access token exists - update state.
      setState({
        isLoading: false,
        isAuthenticated: true,
        shopDomain: result.shopDomain,
      });
    } else {
      // No tokens - update state.
      setState({
        isLoading: false,
        isAuthenticated: false,
        shopDomain: null,
      });
    }
  }, []);

  // Logs out the user and clears authentication data.
  const logout = useCallback(async () => {
    // Get shop domain before clearing.
    const shopDomain = state.shopDomain ?? tokenService.getShopDomain();

    // Call logout service with shop domain.
    if (shopDomain) {
      await logoutService(shopDomain);
    }

    // Clear tokens (also clears cookies).
    tokenService.clearTokens();

    setState({
      isLoading: false,
      isAuthenticated: false,
      shopDomain: null,
    });

    // Redirect to login.
    router.push("/login");
  }, [state.shopDomain, router]);

  // Memoize the context value to prevent unnecessary re-renders.
  const value = useMemo<AuthContextType>(
    () => ({
      ...state,
      setAuth,
      logout,
      getAccessToken,
      recheckAuth,
    }),
    [state, setAuth, logout, getAccessToken, recheckAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access the authentication context.
 *
 * @returns The authentication context.
 * @throws Error if used outside of an AuthProvider.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
