"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function MainNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      // Check admin status
      fetch("/api/auth/check-admin")
        .then((res) => res.json())
        .then((data) => setIsAdmin(data.isAdmin))
        .catch(() => setIsAdmin(false));
    }
  }, [user]);

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/appointments",
      label: "Appointments",
      active: pathname === "/appointments",
    },
    {
      href: "/services",
      label: "Services",
      active: pathname === "/services",
    },
    ...(isAdmin
      ? [
          {
            href: "/admin",
            label: "Admin Dashboard",
            active: pathname.startsWith("/admin"),
          },
        ]
      : []),
  ];

  return (
    <nav className="flex items-center space-x-6 lg:space-x-8">
      <div className="flex items-center space-x-4 lg:space-x-6">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              route.active
                ? "text-black dark:text-white"
                : "text-muted-foreground"
            )}
          >
            {route.label}
          </Link>
        ))}
      </div>
      {user ? (
        <UserButton afterSignOutUrl="/" />
      ) : (
        <SignInButton mode="modal">
          <Button variant="outline">Sign In</Button>
        </SignInButton>
      )}
    </nav>
  );
}
