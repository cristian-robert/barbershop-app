"use server";

import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { getGoogleTokens } from "@/lib/google-calendar";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return new NextResponse("No code provided", { status: 400 });
    }

    // Exchange code for tokens
    const tokens = await getGoogleTokens(code);

    // Store tokens in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
      },
    });

    // Redirect to appointments page
    return NextResponse.redirect(new URL("/appointments", request.url));
  } catch (error) {
    console.error("[GOOGLE_CALLBACK]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
