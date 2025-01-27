import { Service } from "@prisma/client";

export type CreateServiceInput = {
  name: string;
  description: string;
  duration: number;
  price: number;
  image?: string;
};

export type UpdateServiceInput = {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  image?: string;
};

export type ServiceWithAppointments = Service & {
  appointments: {
    id: string;
    startTime: Date;
    endTime: Date;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  }[];
};
