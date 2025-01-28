"use server";

import { currentUser } from "@clerk/nextjs";
import { prisma } from "@/lib/db";
import { AppointmentCalendar } from "./_components/appointment-calendar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AppointmentsPage() {
  const user = await currentUser();
  const services = await prisma.service.findMany({
    orderBy: {
      name: "asc",
    },
  });

  // Add this logging to verify services are being loaded
  console.log('Loaded services:', services);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Book an Appointment
        </h2>
        {!user && (
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Have an account?
            </p>
            <Link href="/sign-in">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        )}
      </div>
      <div className="grid gap-4">
        <AppointmentCalendar services={services} />
      </div>
    </div>
  );
}
