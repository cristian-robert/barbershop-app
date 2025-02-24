import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/api/services",
    "/api/services/(.*)",
    "/api/appointments/(.*)",
    "/api/calendar/(.*)",
    "/api/webhook/(.*)",
    "/sign-in",
    "/sign-up",
  ],
  ignoredRoutes: [
    "/((?!api|trpc))(_next|.+..+)(.+)",
    "/favicon.ico",
    "/site.webmanifest",
  ],
  afterAuth(auth, req) {
    // Handle authenticated requests
    if (auth.isPublicRoute) {
      return NextResponse.next();
    }

    // Redirect to sign in if not authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Allow request to continue
    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
