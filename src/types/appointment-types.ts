// Path: src/types/appointment-types.ts
// Type definitions for appointments

import { Appointment, Service, User } from "@prisma/client";

export type AppointmentWithRelations = Appointment & {
  service: Service;
  user?: User | null;
};

export interface CreateAppointmentInput {
  serviceId: string;
  startTime: Date;
  endTime: Date;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  notes?: string;
}