"use server";

import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default async function AdminDashboardPage() {
  // Fetch counts
  const [appointmentsCount, bannersCount, offersCount] = await Promise.all([
    prisma.appointment.count(),
    prisma.banner.count(),
    prisma.offer.count(),
  ]);

  // Get today's appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAppointments = await prisma.appointment.findMany({
    where: {
      startTime: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      service: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-2">Total Appointments</h3>
          <p className="text-3xl font-bold">{appointmentsCount}</p>
          <Link
            href="/admin/appointments"
            className="text-sm text-primary hover:underline mt-2 block"
          >
            View all
          </Link>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-2">Active Banners</h3>
          <p className="text-3xl font-bold">{bannersCount}</p>
          <Link
            href="/admin/banners"
            className="text-sm text-primary hover:underline mt-2 block"
          >
            Manage banners
          </Link>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-2">Active Offers</h3>
          <p className="text-3xl font-bold">{offersCount}</p>
          <Link
            href="/admin/offers"
            className="text-sm text-primary hover:underline mt-2 block"
          >
            Manage offers
          </Link>
        </Card>
      </div>

      {/* Today's Appointments */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Today's Appointments</h2>
        <Card className="p-6">
          {todayAppointments.length > 0 ? (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                >
                  <div>
                    <p className="font-medium">
                      {appointment.guestName || "Anonymous"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.service.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {new Date(appointment.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No appointments scheduled for today
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
