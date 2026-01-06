import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    console.log("Middleware running for:", request.nextUrl.pathname);
    const authToken = request.cookies.get("auth_token");
    const isLoginPage = request.nextUrl.pathname === "/login";
    const isApiLogin = request.nextUrl.pathname === "/api/login";

    // Allow access to login page and login API
    if (isLoginPage || isApiLogin) {
        // If already authenticated and trying to access login, redirect to home
        if (authToken && isLoginPage) {
            return NextResponse.redirect(new URL("/", request.url));
        }
        return NextResponse.next();
    }

    // Protect all other routes
    if (!authToken) {
        console.log("Redirecting to login");
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
