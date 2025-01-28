// Path: src/app/admin/page.tsx
// This is your admin dashboard page
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export default async function AdminDashboard() {
  // Fetch some basic stats
  const servicesCount = await prisma.service.count();
  const appointmentsCount = await prisma.appointment.count();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4">
          <h2 className="font-semibold">Total Services</h2>
          <p className="text-2xl">{servicesCount}</p>
        </Card>
        <Card className="p-4">
          <h2 className="font-semibold">Total Appointments</h2>
          <p className="text-2xl">{appointmentsCount}</p>
        </Card>
      </div>
    </div>
  );
}