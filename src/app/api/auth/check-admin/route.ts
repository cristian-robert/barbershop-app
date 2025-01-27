"use server";

import { isAdmin } from "@/lib/auth-utils";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const adminStatus = await isAdmin();
    return NextResponse.json({ isAdmin: adminStatus });
  } catch (error) {
    return NextResponse.json({ isAdmin: false });
  }
}
