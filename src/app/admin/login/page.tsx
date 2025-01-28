// Path: src/app/admin/login/page.tsx
// Admin login page

import { SignIn } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  // If user is already logged in, redirect to admin
  const user = await currentUser();
  if (user) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <Image
            src="/logo.png"
            alt="Barbershop Logo"
            width={80}
            height={80}
            className="mx-auto"
          />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">Sign in to manage your barbershop</p>
        </div>
        
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "shadow-none p-0",
            },
          }}
          redirectUrl="/admin"
          afterSignInUrl="/admin"
        />
      </Card>
    </div>
  );
}