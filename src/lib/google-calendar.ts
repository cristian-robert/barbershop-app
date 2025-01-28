import { google } from "googleapis";
import { prisma } from "@/lib/db";
import { AppointmentWithRelations } from "@/types/appointment-types";
import path from "path";

// Load the service account credentials
const CREDENTIALS = require('../../.google-credentials.json');
const CALENDAR_ID = 'rooobyrm999@gmail.com'; // Your email is already set correctly

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// Configure JWT auth client
const auth = new google.auth.JWT(
  CREDENTIALS.client_email,
  undefined,
  CREDENTIALS.private_key,
  SCOPES
);

const calendar = google.calendar({ version: 'v3', auth });

// Function to get the authorization URL
export function getGoogleAuthUrl() {
  const scopes = ["https://www.googleapis.com/auth/calendar"];
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
}

// Function to get tokens from code
export async function getGoogleTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  await oauth2Client.setCredentials(tokens);

  // Store tokens in database for the user
  // You'll need to get the user ID from the session
  return tokens;
}

// Function to set credentials if we have them
export async function setGoogleCredentials(userId: string) {
  const userTokens = await prisma.user.findUnique({
    where: { id: userId },
    select: { googleAccessToken: true, googleRefreshToken: true },
  });

  if (userTokens?.googleAccessToken) {
    oauth2Client.setCredentials({
      access_token: userTokens.googleAccessToken,
      refresh_token: userTokens.googleRefreshToken,
    });
    return true;
  }
  return false;
}

export async function addToGoogleCalendar(appointmentId: string) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: true,
        user: true,
      },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const event = {
      summary: `${appointment.service.name} Appointment`,
      description: `Service: ${appointment.service.name}\n` +
        `Duration: ${appointment.service.duration} minutes\n` +
        `Customer: ${appointment.guestName || appointment.user?.firstName}\n` +
        `Email: ${appointment.guestEmail || appointment.user?.email}\n` +
        `Phone: ${appointment.guestPhone || "N/A"}`,
      start: {
        dateTime: appointment.startTime.toISOString(),
        timeZone: "Europe/Bucharest",
      },
      end: {
        dateTime: appointment.endTime.toISOString(),
        timeZone: "Europe/Bucharest",
      },
    };

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: event,
    });

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        googleEventId: response.data.id,
      },
    });

    return response.data;
  } catch (error) {
    console.error("[GOOGLE_CALENDAR_ERROR]", error);
    throw error;
  }
}

export async function updateGoogleCalendarEvent(appointmentId: string) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: true,
        user: true,
      },
    });

    if (!appointment || !appointment.googleEventId) {
      throw new Error("Appointment or Google Event ID not found");
    }

    // For admin's calendar, we'll use the default credentials
    await setGoogleCredentials(process.env.ADMIN_USER_ID!);

    const event = {
      summary: `${appointment.service.name} Appointment`,
      description: `Service: ${appointment.service.name}
Duration: ${appointment.service.duration} minutes
Customer: ${appointment.guestName || appointment.user?.firstName}
Email: ${appointment.guestEmail || appointment.user?.email}
Phone: ${appointment.guestPhone || "N/A"}
Notes: ${appointment.notes || "No notes"}`,
      start: {
        dateTime: appointment.startTime.toISOString(),
        timeZone: "Europe/Bucharest",
      },
      end: {
        dateTime: appointment.endTime.toISOString(),
        timeZone: "Europe/Bucharest",
      },
      attendees: [
        {
          email: appointment.guestEmail || appointment.user?.email || "",
          displayName:
            appointment.guestName || appointment.user?.firstName || "",
        },
      ],
    };

    const response = await calendar.events.update({
      calendarId: "primary",
      eventId: appointment.googleEventId,
      requestBody: event,
      sendUpdates: "all",
    });

    return response.data;
  } catch (error) {
    console.error("[UPDATE_GOOGLE_CALENDAR_EVENT]", error);
    throw error;
  }
}

export async function deleteGoogleCalendarEvent(appointmentId: string) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment || !appointment.googleEventId) {
      throw new Error("Appointment or Google Event ID not found");
    }

    // For admin's calendar, we'll use the default credentials
    await setGoogleCredentials(process.env.ADMIN_USER_ID!);

    await calendar.events.delete({
      calendarId: "primary",
      eventId: appointment.googleEventId,
      sendUpdates: "all",
    });

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        googleEventId: null,
      },
    });
  } catch (error) {
    console.error("[DELETE_GOOGLE_CALENDAR_EVENT]", error);
    throw error;
  }
}
