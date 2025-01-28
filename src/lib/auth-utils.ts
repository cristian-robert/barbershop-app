// Path: src/lib/auth-utils.ts
// Update your auth utilities
"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const checkAdmin = async () => {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/admin/login");
  }

  // For development, you might want to comment out the database check initially
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return true;
}

export async function isAdmin() {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === "ADMIN";
}