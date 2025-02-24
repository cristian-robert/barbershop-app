import { calendarSync } from "./calendar-sync-service";

let isInitialized = false;

export async function initializeServices() {
  if (isInitialized) {
    console.log("Services already initialized");
    return;
  }

  try {
    // Check environment variables
    const requiredEnvVars = [
      "GOOGLE_CLIENT_EMAIL",
      "GOOGLE_PRIVATE_KEY",
      "GOOGLE_CALENDAR_ID",
    ];

    const missingEnvVars = requiredEnvVars.filter(
      (envVar) => !process.env[envVar]
    );

    if (missingEnvVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(", ")}`
      );
    }

    console.log("Starting calendar sync service...");
    await calendarSync.startSync(5); // Sync every 5 minutes
    console.log("Calendar sync service started successfully");
    isInitialized = true;
  } catch (error) {
    console.error("Failed to initialize services:", error);
    throw error; // Re-throw to handle at the caller level
  }
}

export function isServicesInitialized() {
  return isInitialized;
}
