// Path: src/app/admin/appointments/page.tsx
// Appointments page

import { prisma } from "@/lib/db";
import { AdminAppointmentList } from "./_components/appointment-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function AdminAppointmentsPage() {
  const appointments = await prisma.appointment.findMany({
    include: {
      service: true,
      user: true,
    },
    orderBy: {
      startTime: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>
      <AdminAppointmentList appointments={appointments} />
    </div>
  );
}