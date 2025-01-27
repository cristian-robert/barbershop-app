"use server";

import { prisma } from "@/lib/db";
import { AppointmentCalendar } from "./_components/appointment-calendar";

export default async function AppointmentsPage() {
  // Fetch all active services
  const services = await prisma.service.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Book an Appointment
        </h2>
      </div>
      <div className="grid gap-4">
        <AppointmentCalendar services={services} />
      </div>
    </div>
  );
}
