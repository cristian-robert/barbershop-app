// Path: src/app/sign-in/[[...sign-in]]/page.tsx
// Create this directory structure: src/app/sign-in/[[...sign-in]]/ and create page.tsx inside it
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-md",
          },
        }}
        redirectUrl="/admin"
        afterSignInUrl="/admin"
      />
    </div>
  );
}