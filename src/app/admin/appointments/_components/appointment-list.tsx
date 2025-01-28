// Path: src/app/admin/appointments/_components/appointment-list.tsx
// Appointment list component

"use client";

import { AppointmentWithRelations } from "@/types/appointment-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AdminAppointmentListProps {
  appointments: AppointmentWithRelations[];
}

export function AdminAppointmentList({ appointments }: AdminAppointmentListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>
                {new Date(appointment.startTime).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(appointment.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
              <TableCell>{appointment.service.name}</TableCell>
              <TableCell>
                {appointment.guestName || appointment.user?.firstName || "Anonymous"}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(appointment.status)}>
                  {appointment.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function getStatusVariant(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "success";
    case "PENDING":
      return "warning";
    case "CANCELLED":
      return "destructive";
    default:
      return "default";
  }
}