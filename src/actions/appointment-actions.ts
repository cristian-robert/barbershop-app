"use server";

import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ActionState } from "@/types";
import { addToGoogleCalendar } from "@/lib/google-calendar";
import {
  AppointmentWithRelations,
  CreateAppointmentInput,
} from "@/types/appointment-types";
import { Prisma } from "@prisma/client";

const appointmentInclude = {
  service: true,
  user: true,
} satisfies Prisma.AppointmentInclude;

export async function getAppointments(): Promise<
  ActionState<AppointmentWithRelations[]>
> {
  try {
    const { userId } = auth();

    const appointments = await prisma.appointment.findMany({
      where: userId ? { userId } : undefined,
      include: appointmentInclude,
      orderBy: {
        date: "asc",
      },
    });

    return {
      isSuccess: true,
      message: "Appointments retrieved successfully",
      data: appointments as AppointmentWithRelations[],
    };
  } catch (error) {
    console.error("[GET_APPOINTMENTS]", error);
    return {
      isSuccess: false,
      message: "Failed to get appointments",
    };
  }
}

export async function createAppointment(
  data: CreateAppointmentInput
): Promise<ActionState<AppointmentWithRelations>> {
  try {
    const { userId } = auth();

    // Check if the time slot is available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        OR: [
          {
            AND: [
              { date: { lte: data.startTime } },
              { date: { gt: data.startTime } },
            ],
          },
          {
            AND: [
              { date: { lt: data.endTime } },
              { date: { gte: data.endTime } },
            ],
          },
        ],
        status: "CONFIRMED",
      },
    });

    if (existingAppointment) {
      return {
        isSuccess: false,
        message: "This time slot is already booked",
      };
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: userId || undefined,
        serviceId: data.serviceId,
        date: data.startTime,
        status: "PENDING",
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        notes: data.notes,
      },
      include: appointmentInclude,
    });

    // Add to Google Calendar
    try {
      await addToGoogleCalendar(appointment.id);
    } catch (error) {
      console.error("[GOOGLE_CALENDAR_ERROR]", error);
      // Don't fail the appointment creation if Google Calendar fails
    }

    revalidatePath("/appointments");

    return {
      isSuccess: true,
      message: "Appointment created successfully",
      data: appointment as AppointmentWithRelations,
    };
  } catch (error) {
    console.error("[CREATE_APPOINTMENT]", error);
    return {
      isSuccess: false,
      message: "Failed to create appointment",
    };
  }
}

export async function cancelAppointment(
  appointmentId: string
): Promise<ActionState<AppointmentWithRelations>> {
  try {
    const { userId } = auth();

    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
        ...(userId ? { userId } : {}),
      },
    });

    if (!appointment) {
      return {
        isSuccess: false,
        message: "Appointment not found",
      };
    }

    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: "CANCELLED",
      },
      include: appointmentInclude,
    });

    revalidatePath("/appointments");

    return {
      isSuccess: true,
      message: "Appointment cancelled successfully",
      data: updatedAppointment as AppointmentWithRelations,
    };
  } catch (error) {
    console.error("[CANCEL_APPOINTMENT]", error);
    return {
      isSuccess: false,
      message: "Failed to cancel appointment",
    };
  }
}

export async function getAvailableTimeSlots(
  date: Date,
  serviceId: string
): Promise<ActionState<string[]>> {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return {
        isSuccess: false,
        message: "Service not found",
      };
    }

    // Get all appointments for the selected date
    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(24, 0, 0, 0)),
        },
        status: "CONFIRMED",
      },
      orderBy: {
        date: "asc",
      },
    });

    // Generate all possible time slots
    const slots: string[] = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    const duration = service.duration;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += duration) {
        if (hour === endHour - 1 && minute + duration > 60) continue;
        slots.push(
          `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`
        );
      }
    }

    // Filter out booked slots
    const availableSlots = slots.filter((slot) => {
      const [hours, minutes] = slot.split(":").map(Number);
      const slotStart = new Date(date);
      slotStart.setHours(hours, minutes, 0, 0);
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + duration);

      return !appointments.some((apt) => {
        const aptDate = apt.date;
        return (
          (aptDate <= slotStart && aptDate > slotStart) ||
          (aptDate < slotEnd && aptDate >= slotEnd)
        );
      });
    });

    return {
      isSuccess: true,
      message: "Available time slots retrieved successfully",
      data: availableSlots,
    };
  } catch (error) {
    console.error("[GET_AVAILABLE_TIME_SLOTS]", error);
    return {
      isSuccess: false,
      message: "Failed to get available time slots",
    };
  }
}
