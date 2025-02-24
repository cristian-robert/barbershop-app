import { google } from "googleapis";
import path from "path";

// Load the service account credentials
const CREDENTIALS = require("../../.google-credentials.json");
const CALENDAR_ID = "rooobyrm999@gmail.com"; // Your email is already set correctly

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

// Configure JWT auth client
const auth = new google.auth.JWT(
  CREDENTIALS.client_email,
  undefined,
  CREDENTIALS.private_key,
  SCOPES
);

const calendar = google.calendar({ version: "v3", auth });

export async function getCalendarEvents(startTime: Date, endTime: Date) {
  try {
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    return response.data.items || [];
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
}

export async function addCalendarEvent(event: {
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
}) {
  try {
    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: "Europe/Bucharest",
        },
        end: {
          dateTime: event.endTime.toISOString(),
          timeZone: "Europe/Bucharest",
        },
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating calendar event:", error);
    throw error;
  }
}
