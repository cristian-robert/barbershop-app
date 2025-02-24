"use server";

import { prisma } from "@/lib/db";
import { ActionState } from "@/types";
import { SiteSettings } from "@/types/site-settings";
import { revalidatePath } from "next/cache";

export async function getSiteSettings(): Promise<ActionState<SiteSettings>> {
  try {
    const settings = await prisma.siteSettings.findFirst({
      where: { active: true },
    });

    if (!settings) {
      return {
        isSuccess: false,
        message: "Site settings not found",
      };
    }

    return {
      isSuccess: true,
      message: "Settings retrieved successfully",
      data: settings.data as SiteSettings,
    };
  } catch (error) {
    console.error("[GET_SITE_SETTINGS]", error);
    return {
      isSuccess: false,
      message: "Failed to retrieve site settings",
    };
  }
}

export async function updateSiteSettings(
  data: Partial<SiteSettings>
): Promise<ActionState<SiteSettings>> {
  try {
    const settings = await prisma.siteSettings.upsert({
      where: { active: true },
      create: {
        data: data as any,
        active: true,
      },
      update: {
        data: data as any,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");

    return {
      isSuccess: true,
      message: "Settings updated successfully",
      data: settings.data as SiteSettings,
    };
  } catch (error) {
    console.error("[UPDATE_SITE_SETTINGS]", error);
    return {
      isSuccess: false,
      message: "Failed to update site settings",
    };
  }
}

export async function resetSiteSettings(): Promise<ActionState<void>> {
  try {
    await prisma.siteSettings.update({
      where: { active: true },
      data: {
        data: getDefaultSettings(),
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");

    return {
      isSuccess: true,
      message: "Settings reset successfully",
    };
  } catch (error) {
    console.error("[RESET_SITE_SETTINGS]", error);
    return {
      isSuccess: false,
      message: "Failed to reset site settings",
    };
  }
}

function getDefaultSettings(): SiteSettings {
  return {
    theme: {
      primaryColor: "#000000",
      secondaryColor: "#ffffff",
      accentColor: "#cccccc",
      fontSize: "medium",
      fontFamily: "Inter",
    },
    business: {
      name: "Barbershop",
      description: "Professional haircuts and styling services",
      address: "",
      phone: "",
      email: "",
      socialLinks: {},
    },
    booking: {
      minAdvanceHours: 24,
      maxAdvanceDays: 30,
      timeSlotDuration: 30,
      allowGuestBooking: true,
      requireDeposit: false,
    },
    content: {
      homepageTitle: "Welcome to Barbershop",
      homepageDescription: "Professional haircuts and styling services",
      aboutText: "",
      cancellationPolicy: "",
      privacyPolicy: "",
    },
    notifications: {
      enableEmailNotifications: true,
      enableSMSNotifications: false,
      reminderHours: 24,
      customEmailTemplates: {
        booking: "",
        confirmation: "",
        reminder: "",
        cancellation: "",
      },
    },
  };
}
