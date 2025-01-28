// Admin sidebar component
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, LayoutDashboard, Settings, Users, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    label: "Appointments",
    icon: Calendar,
    href: "/admin/appointments",
  },
  {
    label: "Customers",
    icon: Users,
    href: "/admin/customers",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex h-full w-72 flex-col bg-white border-r px-4 py-8">
      <div className="flex items-center justify-between mb-8 px-4">
        <h1 className="text-xl font-bold">Barbershop Admin</h1>
        <UserButton afterSignOutUrl="/admin/login" />
      </div>
      <div className="space-y-2 px-2 flex-1">
        {routes.map((route) => (
          <Link key={route.href} href={route.href}>
            <Button
              variant={pathname === route.href ? "default" : "ghost"}
              className={cn("w-full justify-start gap-x-2", 
                pathname === route.href && "bg-primary text-primary-foreground"
              )}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}