import { z } from "zod";

export const siteSettingsSchema = z.object({
  // Theme settings
  theme: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    accentColor: z.string(),
    fontSize: z.enum(["small", "medium", "large"]),
    fontFamily: z.string(),
  }),

  // Business settings
  business: z.object({
    name: z.string().min(2),
    description: z.string(),
    logo: z.string().optional(),
    address: z.string(),
    phone: z.string(),
    email: z.string().email(),
    socialLinks: z.object({
      facebook: z.string().url().optional(),
      instagram: z.string().url().optional(),
      twitter: z.string().url().optional(),
    }),
  }),

  // Booking settings
  booking: z.object({
    minAdvanceHours: z.number().min(0),
    maxAdvanceDays: z.number().min(1),
    timeSlotDuration: z.number().min(15),
    allowGuestBooking: z.boolean(),
    requireDeposit: z.boolean(),
    depositAmount: z.number().optional(),
  }),

  // Content settings
  content: z.object({
    homepageTitle: z.string(),
    homepageDescription: z.string(),
    aboutText: z.string(),
    cancellationPolicy: z.string(),
    privacyPolicy: z.string(),
  }),

  // Notification settings
  notifications: z.object({
    enableEmailNotifications: z.boolean(),
    enableSMSNotifications: z.boolean(),
    reminderHours: z.number().min(1),
    customEmailTemplates: z.object({
      booking: z.string(),
      confirmation: z.string(),
      reminder: z.string(),
      cancellation: z.string(),
    }),
  }),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;
