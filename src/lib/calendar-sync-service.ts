import { prisma } from "@/lib/db";
import { CalendarService } from "./calendar-service";
import { addDays, startOfDay, endOfDay } from "date-fns";
import { Appointment, AppointmentStatus, Service } from "@prisma/client";
import { GoogleCalendarEvent } from "@/types/google-calendar-types";

export class CalendarSyncService {
  private calendarService!: CalendarService;
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing: boolean = false;

  constructor() {
    if (typeof window === "undefined") {
      // Only initialize on server-side
      this.calendarService = new CalendarService();
    }
  }

  async startSync(intervalMinutes: number = 5) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Initial sync
    await this.syncCalendar();

    // Set up periodic sync
    this.syncInterval = setInterval(async () => {
      await this.syncCalendar();
    }, intervalMinutes * 60 * 1000);
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private async syncCalendar() {
    if (this.isSyncing) {
      console.log("Sync already in progress, skipping...");
      return;
    }

    try {
      this.isSyncing = true;
      console.log("Starting calendar sync...");

      // Sync window: from now to 30 days ahead
      const startTime = startOfDay(new Date());
      const endTime = endOfDay(addDays(startTime, 30));

      // Fetch events from Google Calendar
      const calendarEvents = await this.calendarService.listEvents(
        startTime,
        endTime
      );

      // Fetch existing appointments from database
      const existingAppointments = await prisma.appointment.findMany({
        where: {
          startTime: {
            gte: startTime,
            lte: endTime,
          },
        },
        include: {
          service: true,
        },
      });

      // Update appointment statuses based on Google Calendar
      for (const appointment of existingAppointments) {
        const matchingEvent = calendarEvents.find(
          (event: GoogleCalendarEvent) => event.id === appointment.googleEventId
        );

        if (!matchingEvent && appointment.status !== "CANCELLED") {
          // Event was deleted in Google Calendar
          await this.updateAppointmentStatus(appointment.id, "CANCELLED");
          if (appointment.googleEventId) {
            await this.calendarService.deleteEvent(appointment.googleEventId);
          }
        } else if (matchingEvent) {
          // Check if event was modified in Google Calendar
          const eventStart = new Date(matchingEvent.start.dateTime);
          const eventEnd = new Date(matchingEvent.end.dateTime);

          if (
            eventStart.getTime() !== appointment.startTime.getTime() ||
            eventEnd.getTime() !== appointment.endTime.getTime()
          ) {
            // Update appointment times
            await prisma.appointment.update({
              where: { id: appointment.id },
              data: {
                startTime: eventStart,
                endTime: eventEnd,
              },
            });

            // Update Google Calendar event
            if (appointment.googleEventId && appointment.guestEmail) {
              await this.calendarService.updateEvent(
                appointment.googleEventId,
                `${appointment.service.name} - ${appointment.guestName}`,
                `Appointment for ${appointment.guestName}\nEmail: ${appointment.guestEmail}\nPhone: ${appointment.guestPhone}`,
                eventStart,
                eventEnd,
                appointment.guestEmail
              );
            }
          }
        }
      }

      // Create new appointments for events that don't exist in our database
      const defaultService = await prisma.service.findFirst();
      if (!defaultService) {
        console.error("No default service found for imported appointments");
        return;
      }

      for (const event of calendarEvents as GoogleCalendarEvent[]) {
        const existingAppointment = existingAppointments.find(
          (apt) => apt.googleEventId === event.id
        );

        if (!existingAppointment) {
          await prisma.appointment.create({
            data: {
              startTime: new Date(event.start.dateTime),
              endTime: new Date(event.end.dateTime),
              status: "CONFIRMED",
              googleEventId: event.id,
              notes: `Imported from Google Calendar: ${
                event.summary || "No title"
              }`,
              service: {
                connect: {
                  id: defaultService.id,
                },
              },
            },
          });
        }
      }

      console.log("Calendar sync completed successfully");
    } catch (error) {
      console.error("Error during calendar sync:", error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus
  ) {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });
  }

  // Helper method to check if a time slot is available
  async isTimeSlotAvailable(
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: string
  ): Promise<{ available: boolean; error?: string }> {
    try {
      if (!this.calendarService) {
        throw new Error(
          "Calendar service not initialized - server-side operation only"
        );
      }
      const overlappingAppointments = await prisma.appointment.findMany({
        where: {
          AND: [
            {
              startTime: { lte: endTime },
              endTime: { gte: startTime },
            },
            {
              status: "CONFIRMED",
            },
            {
              id: excludeAppointmentId
                ? { not: excludeAppointmentId }
                : undefined,
            },
          ],
        },
      });

      // Also check Google Calendar for any conflicts
      const calendarEvents = await this.calendarService.listEvents(
        startTime,
        endTime
      );

      const hasCalendarConflict = calendarEvents.some((event) => {
        const eventStart = new Date(event.start.dateTime);
        const eventEnd = new Date(event.end.dateTime);
        return eventStart < endTime && eventEnd > startTime;
      });

      return {
        available: overlappingAppointments.length === 0 && !hasCalendarConflict,
      };
    } catch (error) {
      console.error("Error checking time slot availability:", error);
      return {
        available: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check availability",
      };
    }
  }

  // Helper method to create a Google Calendar event for an appointment
  async createCalendarEvent(
    appointment: Appointment & { service: Service }
  ): Promise<GoogleCalendarEvent | null> {
    try {
      if (!appointment.guestEmail) {
        console.error("Guest email is required for calendar events");
        return null;
      }

      const event = await this.calendarService.createEvent(
        `${appointment.service.name} - ${appointment.guestName}`,
        `Appointment for ${appointment.guestName}\nEmail: ${appointment.guestEmail}\nPhone: ${appointment.guestPhone}`,
        appointment.startTime,
        appointment.endTime,
        appointment.guestEmail
      );

      if (event) {
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { googleEventId: event.id },
        });
      }

      return event;
    } catch (error) {
      console.error("Error creating calendar event:", error);
      return null;
    }
  }
}

// Export a singleton instance
export const calendarSync = new CalendarSyncService();
