"use server";

import { checkAdmin } from "@/lib/auth-utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const adminNavItems = [
  {
    href: "/admin",
    label: "Overview",
  },
  {
    href: "/admin/appointments",
    label: "Appointments",
  },
  {
    href: "/admin/banners",
    label: "Banners",
  },
  {
    href: "/admin/offers",
    label: "Offers",
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAdmin();

  return (
    <div className="container mx-auto py-6">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-64 pr-8">
          <nav className="space-y-2">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-4 py-2 rounded-lg transition-colors",
                  "hover:bg-muted",
                  "text-sm font-medium"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-card rounded-lg shadow-sm p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
