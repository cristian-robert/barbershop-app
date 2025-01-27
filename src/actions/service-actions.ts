"use server";

import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ActionState } from "@/types";

export async function getServices(): Promise<ActionState<any>> {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return {
      isSuccess: true,
      message: "Services retrieved successfully",
      data: services,
    };
  } catch (error) {
    console.error("[GET_SERVICES]", error);
    return {
      isSuccess: false,
      message: "Failed to get services",
    };
  }
}

export async function getService(id: string): Promise<ActionState<any>> {
  try {
    const service = await prisma.service.findUnique({
      where: {
        id,
      },
    });

    if (!service) {
      return {
        isSuccess: false,
        message: "Service not found",
      };
    }

    return {
      isSuccess: true,
      message: "Service retrieved successfully",
      data: service,
    };
  } catch (error) {
    console.error("[GET_SERVICE]", error);
    return {
      isSuccess: false,
      message: "Failed to get service",
    };
  }
}

export async function createService(data: {
  name: string;
  description: string;
  duration: number;
  price: number;
  image?: string;
}): Promise<ActionState<any>> {
  try {
    const { userId } = auth();

    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const service = await prisma.service.create({
      data,
    });

    revalidatePath("/services");

    return {
      isSuccess: true,
      message: "Service created successfully",
      data: service,
    };
  } catch (error) {
    console.error("[CREATE_SERVICE]", error);
    return {
      isSuccess: false,
      message: "Failed to create service",
    };
  }
}

export async function updateService(
  id: string,
  data: {
    name?: string;
    description?: string;
    duration?: number;
    price?: number;
    image?: string;
  }
): Promise<ActionState<any>> {
  try {
    const { userId } = auth();

    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const service = await prisma.service.update({
      where: {
        id,
      },
      data,
    });

    revalidatePath("/services");

    return {
      isSuccess: true,
      message: "Service updated successfully",
      data: service,
    };
  } catch (error) {
    console.error("[UPDATE_SERVICE]", error);
    return {
      isSuccess: false,
      message: "Failed to update service",
    };
  }
}

export async function deleteService(id: string): Promise<ActionState<any>> {
  try {
    const { userId } = auth();

    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    await prisma.service.delete({
      where: {
        id,
      },
    });

    revalidatePath("/services");

    return {
      isSuccess: true,
      message: "Service deleted successfully",
      data: null,
    };
  } catch (error) {
    console.error("[DELETE_SERVICE]", error);
    return {
      isSuccess: false,
      message: "Failed to delete service",
    };
  }
}
