// Path: src/middleware.ts
// Update your middleware to handle auth properly
import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // Make all routes public by default
  publicRoutes: [
    "/",
    "/services",
    "/about",
    "/contact",
    "/api/webhook",
    "/api/uploadthing",
    "/sign-in",
    "/sign-up",
    "/admin/login",
  ],
  
  afterAuth(auth, req) {
    // Only protect /admin routes
    if (req.nextUrl.pathname.startsWith("/admin") && 
        !req.nextUrl.pathname.startsWith("/admin/login")) {
      if (!auth.userId) {
        const signInUrl = new URL('/admin/login', req.url);
        return NextResponse.redirect(signInUrl);
      }
    }

    // Allow all other routes
    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};