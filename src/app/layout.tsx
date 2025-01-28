// Path: src/app/layout.tsx
// This is your root layout - it should keep all your existing styles
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import { Toaster } from "sonner"
import "./globals.css" // Make sure to keep your global styles

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        <body className={inter.className}>
          <main className="min-h-screen flex flex-col">
            {children}
          </main>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}