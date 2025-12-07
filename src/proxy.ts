import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protected routes that require authentication.
 * Users without valid tokens will be redirected to login.
 */
const PROTECTED_ROUTES = ["/dashboard", "/wizard"];

/**
 * Auth routes that should redirect to dashboard if user is already authenticated.
 */
const AUTH_ROUTES = ["/login"];

/**
 * Public routes that don't require authentication.
 */
const PUBLIC_ROUTES = ["/", "/auth/callback"];

/**
 * Cookie names for authentication tokens.
 */
const ACCESS_TOKEN_COOKIE = "lunalight_access_token";
const REFRESH_TOKEN_COOKIE = "lunalight_refresh_token";

/**
 * Checks if a pathname matches any of the provided route patterns.
 *
 * @param pathname - The current request pathname.
 * @param routes - Array of route patterns to match against.
 * @returns True if pathname matches any route pattern.
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/**
 * Proxy function that handles authentication-based route protection.
 *
 * This proxy runs before routes are rendered and handles:
 * - Redirecting unauthenticated users from protected routes to login.
 * - Redirecting authenticated users from auth routes to dashboard.
 * - Allowing access to public routes for everyone.
 *
 * Authentication check logic:
 * - ONLY access token grants authentication, this is the source of truth.
 * - Refresh token alone does NOT grant access to protected routes.
 * - Client-side auth provider handles token refresh and sets access token cookie.
 * - Once access token cookie exists, proxy allows access.
 *
 * @param request - The incoming request.
 * @returns NextResponse with redirect or next() to continue.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Get authentication tokens from cookies.
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // User is authenticated ONLY if they have a valid access token.
  // Refresh token alone does NOT grant access - it's only used to obtain new access tokens.
  const hasAccessToken = Boolean(accessToken);
  const hasRefreshTokenOnly = Boolean(!accessToken && refreshToken);

  // Allow public routes for everyone.
  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth routes.
  if (matchesRoute(pathname, AUTH_ROUTES)) {
    if (hasAccessToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protect routes that require authentication.
  if (matchesRoute(pathname, PROTECTED_ROUTES)) {
    // If user has access token, allow access.
    if (hasAccessToken) {
      return NextResponse.next();
    }

    // If user has only refresh token, allow access to the page.
    // The client-side auth provider will refresh tokens and set access token cookie.
    // If refresh fails, user will be redirected to login from client-side.
    if (hasRefreshTokenOnly) {
      return NextResponse.next();
    }

    // No tokens at all, redirect to login.
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow all other routes.
  return NextResponse.next();
}

/**
 * Matcher configuration to specify which paths the proxy should run on.
 * Excludes static files, API routes, and image optimization paths.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes - handled by backend).
     * - _next/static (static files).
     * - _next/image (image optimization files).
     * - favicon.ico, sitemap.xml, robots.txt (metadata files).
     * - Public assets (images, fonts, etc.).
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
};
