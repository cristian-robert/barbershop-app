import type { Appointment, Service } from "@prisma/client";

export interface AppointmentWithRelations extends Appointment {
  service: Service;
}

export interface CreateAppointmentInput {
  serviceId: string;
  startTime: Date;
  endTime: Date;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  notes?: string;
}

export interface UpdateAppointmentInput {
  status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  startTime?: Date;
  endTime?: Date;
  notes?: string;
}

export interface GetAppointmentsFilters {
  userId?: string;
  status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  startDate?: Date;
  endDate?: Date;
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
}

export interface AppointmentResponse {
  id: string;
  service: Service;
  userId?: string | null;
  startTime: Date;
  endTime: Date;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  googleEventId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
