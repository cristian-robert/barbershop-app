"use client";

import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function SignUpPage() {
  const { theme } = useTheme();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        appearance={{
          baseTheme: theme === "dark" ? dark : undefined,
          elements: {
            formButtonPrimary: "bg-primary hover:bg-primary/90",
            footerActionLink: "text-primary hover:text-primary/90",
          },
        }}
      />
    </div>
  );
}
