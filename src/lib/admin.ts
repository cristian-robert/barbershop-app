// Path: src/lib/admin.ts
// Admin utilities and checks

import { auth } from "@clerk/nextjs";
import { prisma } from "./db";

// List of admin email addresses
const ADMIN_EMAILS = ["admin@barbershop.com"];

export async function isAdmin() {
  const { userId } = auth();
  
  if (!userId) return false;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, role: true },
  });
  
  return user?.role === "ADMIN" || ADMIN_EMAILS.includes(user?.email || "");
}