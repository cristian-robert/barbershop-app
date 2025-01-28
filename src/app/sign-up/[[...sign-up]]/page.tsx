// Path: src/app/sign-up/[[...sign-up]]/page.tsx
// Create this directory structure: src/app/sign-up/[[...sign-up]]/ and create page.tsx inside it
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-md",
          },
        }}
        redirectUrl="/admin"
        afterSignUpUrl="/admin"
      />
    </div>
  );
}