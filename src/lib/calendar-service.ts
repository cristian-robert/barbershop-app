import jwt from "jsonwebtoken";
import { GoogleCalendarEvent } from "@/types/google-calendar-types";

export class CalendarService {
  private credentials: {
    client_email: string;
    private_key: string;
  };
  private baseUrl = "https://www.googleapis.com/calendar/v3";

  constructor() {
    console.log("Environment variables:", {
      hasEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
      hasKey: !!process.env.GOOGLE_PRIVATE_KEY,
    });

    this.credentials = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL || "",
      private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    };
  }

  private async getAccessToken() {
    try {
      if (!this.credentials.client_email || !this.credentials.private_key) {
        throw new Error("Missing Google Calendar credentials");
      }

      const tokenUrl = "https://oauth2.googleapis.com/token";
      const assertion = this.generateJWT();

      console.log(
        "Requesting access token with client email:",
        this.credentials.client_email
      );
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion,
        }),
      });

      const data = await response.json();
      console.log("Token response:", {
        success: !!data.access_token,
        error: data.error,
        errorDescription: data.error_description,
      });

      if (!data.access_token) {
        throw new Error(
          `Failed to get access token: ${
            data.error_description || data.error || "Unknown error"
          }`
        );
      }

      return data.access_token;
    } catch (error) {
      console.error("Error getting access token:", error);
      throw error;
    }
  }

  private generateJWT(): string {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.credentials.client_email,
      scope: "https://www.googleapis.com/auth/calendar",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };

    return jwt.sign(payload, this.credentials.private_key, {
      algorithm: "RS256",
    });
  }

  async listEvents(
    startTime: Date,
    endTime: Date
  ): Promise<GoogleCalendarEvent[]> {
    try {
      console.log("Fetching events for:", { startTime, endTime });

      const accessToken = await this.getAccessToken();
      const calendarId = encodeURIComponent(
        process.env.GOOGLE_CALENDAR_ID || "primary"
      );
      const url =
        `${this.baseUrl}/calendars/${calendarId}/events?` +
        new URLSearchParams({
          timeMin: startTime.toISOString(),
          timeMax: endTime.toISOString(),
          singleEvents: "true",
          orderBy: "startTime",
        });

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      console.log("Calendar response:", {
        success: !data.error,
        itemsCount: data.items?.length,
        error: data.error,
      });

      return data.items || [];
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  }

  async createEvent(
    summary: string,
    description: string,
    startTime: Date,
    endTime: Date,
    attendeeEmail?: string
  ): Promise<GoogleCalendarEvent | null> {
    try {
      const accessToken = await this.getAccessToken();
      const calendarId = encodeURIComponent(
        process.env.GOOGLE_CALENDAR_ID || "primary"
      );
      const url = `${this.baseUrl}/calendars/${calendarId}/events`;

      const eventData = {
        summary,
        description,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: "UTC",
        },
        ...(attendeeEmail
          ? {
              attendees: [{ email: attendeeEmail }],
              sendUpdates: "all",
            }
          : {}),
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();
      if (data.error) {
        console.error("Error creating event:", data.error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error creating event:", error);
      return null;
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const calendarId = encodeURIComponent(
        process.env.GOOGLE_CALENDAR_ID || "primary"
      );
      const url = `${this.baseUrl}/calendars/${calendarId}/events/${eventId}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.status === 204;
    } catch (error) {
      console.error("Error deleting event:", error);
      return false;
    }
  }

  async updateEvent(
    eventId: string,
    summary: string,
    description: string,
    startTime: Date,
    endTime: Date,
    attendeeEmail?: string
  ): Promise<GoogleCalendarEvent | null> {
    try {
      const accessToken = await this.getAccessToken();
      const calendarId = encodeURIComponent(
        process.env.GOOGLE_CALENDAR_ID || "primary"
      );
      const url = `${this.baseUrl}/calendars/${calendarId}/events/${eventId}`;

      const eventData = {
        summary,
        description,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: "UTC",
        },
        ...(attendeeEmail
          ? {
              attendees: [{ email: attendeeEmail }],
              sendUpdates: "all",
            }
          : {}),
      };

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();
      if (data.error) {
        console.error("Error updating event:", data.error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error updating event:", error);
      return null;
    }
  }
}
