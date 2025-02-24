"use server";

import { prisma } from "@/lib/db";
import { ActionState } from "@/types";
import { calendarSync } from "@/lib/calendar-sync-service";
import { addMinutes, format, parse, startOfDay, endOfDay } from "date-fns";
import { AppointmentStatus, Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs";

interface CreateAppointmentParams {
  serviceId: string;
  startTime: Date;
  endTime: Date;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export async function getAvailableTimeSlots(
  date: Date,
  serviceId: string
): Promise<ActionState<TimeSlot[]>> {
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

    const startTime = startOfDay(date);
    const endTime = endOfDay(date);

    // Business hours (9 AM to 5 PM)
    const businessStart = 9;
    const businessEnd = 17;
    const slotDuration = 30; // minutes
    const slots: TimeSlot[] = [];

    // Get existing appointments for the day
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        startTime: {
          gte: startTime,
          lte: endTime,
        },
        status: "CONFIRMED",
      },
    });

    // Generate all possible time slots
    for (let hour = businessStart; hour < businessEnd; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);

        const slotEndTime = new Date(slotTime);
        slotEndTime.setMinutes(slotEndTime.getMinutes() + service.duration);

        // Skip slots that would end after business hours
        if (slotEndTime.getHours() >= businessEnd) continue;

        // Check if slot conflicts with existing appointments
        const isConflicting = existingAppointments.some(
          (appointment) =>
            slotTime < new Date(appointment.endTime) &&
            slotEndTime > new Date(appointment.startTime)
        );

        const availabilityCheck = await calendarSync.isTimeSlotAvailable(
          slotTime,
          slotEndTime
        );

        if (availabilityCheck.error) {
          console.error(
            `[GET_AVAILABLE_TIME_SLOTS] Availability check error:`,
            availabilityCheck.error
          );
          return {
            isSuccess: false,
            message: `Failed to check availability: ${availabilityCheck.error}`,
          };
        }

        slots.push({
          time: format(slotTime, "HH:mm"),
          available: !isConflicting && availabilityCheck.available,
        });
      }
    }

    return {
      isSuccess: true,
      message: "Available time slots retrieved successfully",
      data: slots,
    };
  } catch (error) {
    console.error("[GET_AVAILABLE_TIME_SLOTS]", error);
    return {
      isSuccess: false,
      message: "Failed to get available time slots",
    };
  }
}

export async function createAppointment(
  params: CreateAppointmentParams
): Promise<ActionState<void>> {
  try {
    const { userId } = auth();
    const { serviceId, startTime, endTime, guestName, guestEmail, guestPhone } =
      params;

    // Verify service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return {
        isSuccess: false,
        message: "Service not found",
      };
    }

    // Check if the time slot is still available
    const availabilityCheck = await calendarSync.isTimeSlotAvailable(
      startTime,
      endTime
    );

    if (availabilityCheck.error) {
      return {
        isSuccess: false,
        message: `Failed to check availability: ${availabilityCheck.error}`,
      };
    }

    if (!availabilityCheck.available) {
      return {
        isSuccess: false,
        message: "Selected time slot is no longer available",
      };
    }

    // Create the appointment data
    const appointmentData: Prisma.AppointmentCreateInput = {
      startTime,
      endTime,
      status: "CONFIRMED",
      guestName,
      guestEmail,
      guestPhone,
      service: {
        connect: {
          id: serviceId,
        },
      },
      ...(userId
        ? {
            user: {
              connect: {
                id: userId,
              },
            },
          }
        : {}),
    };

    // Create the appointment
    await prisma.appointment.create({
      data: appointmentData,
    });

    return {
      isSuccess: true,
      message: "Appointment created successfully",
      data: undefined,
    };
  } catch (error) {
    console.error("[CREATE_APPOINTMENT]", error);
    return {
      isSuccess: false,
      message: "Failed to create appointment",
    };
  }
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<ActionState<void>> {
  try {
    const { userId } = auth();

    // Only allow admin or the appointment owner to update status
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return {
        isSuccess: false,
        message: "Appointment not found",
      };
    }

    if (!userId || (appointment.userId && appointment.userId !== userId)) {
      return {
        isSuccess: false,
        message: "Unauthorized to update appointment status",
      };
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });

    return {
      isSuccess: true,
      message: "Appointment status updated successfully",
      data: undefined,
    };
  } catch (error) {
    console.error("[UPDATE_APPOINTMENT_STATUS]", error);
    return {
      isSuccess: false,
      message: "Failed to update appointment status",
    };
  }
}

export async function getAppointmentsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<ActionState<any[]>> {
  try {
    const { userId } = auth();

    const appointments = await prisma.appointment.findMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        ...(userId ? { userId } : {}),
      },
      include: {
        service: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return {
      isSuccess: true,
      message: "Appointments retrieved successfully",
      data: appointments,
    };
  } catch (error) {
    console.error("[GET_APPOINTMENTS]", error);
    return {
      isSuccess: false,
      message: "Failed to retrieve appointments",
    };
  }
}
