"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import {
  ActionState,
  CreatePopupInput,
  Popup,
  UpdatePopupInput,
} from "@/types";
import { revalidatePath } from "next/cache";

export async function createPopup(
  input: CreatePopupInput
): Promise<ActionState<Popup>> {
  try {
    const { userId } = auth();

    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const popup = await prisma.popup.create({
      data: {
        ...input,
      },
    });

    revalidatePath("/admin/popups");

    return {
      isSuccess: true,
      message: "Popup created successfully",
      data: popup,
    };
  } catch (error) {
    console.error("[CREATE_POPUP_ERROR]", error);
    return {
      isSuccess: false,
      message: "Something went wrong",
    };
  }
}

export async function updatePopup(
  input: UpdatePopupInput
): Promise<ActionState<Popup>> {
  try {
    const { userId } = auth();

    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const popup = await prisma.popup.update({
      where: { id: input.id },
      data: {
        title: input.title,
        content: input.content,
        type: input.type,
        active: input.active,
        startDate: input.startDate,
        endDate: input.endDate,
        delay: input.delay,
        frequency: input.frequency,
        position: input.position,
      },
    });

    revalidatePath("/admin/popups");

    return {
      isSuccess: true,
      message: "Popup updated successfully",
      data: popup,
    };
  } catch (error) {
    console.error("[UPDATE_POPUP_ERROR]", error);
    return {
      isSuccess: false,
      message: "Something went wrong",
    };
  }
}

export async function deletePopup(id: string): Promise<ActionState<Popup>> {
  try {
    const { userId } = auth();

    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const popup = await prisma.popup.delete({
      where: { id },
    });

    revalidatePath("/admin/popups");

    return {
      isSuccess: true,
      message: "Popup deleted successfully",
      data: popup,
    };
  } catch (error) {
    console.error("[DELETE_POPUP_ERROR]", error);
    return {
      isSuccess: false,
      message: "Something went wrong",
    };
  }
}

export async function getPopups(): Promise<ActionState<Popup[]>> {
  try {
    const { userId } = auth();

    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const popups = await prisma.popup.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      isSuccess: true,
      message: "Popups retrieved successfully",
      data: popups,
    };
  } catch (error) {
    console.error("[GET_POPUPS_ERROR]", error);
    return {
      isSuccess: false,
      message: "Something went wrong",
    };
  }
}

export async function getPopup(id: string): Promise<ActionState<Popup>> {
  try {
    const { userId } = auth();

    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const popup = await prisma.popup.findUnique({
      where: { id },
    });

    if (!popup) {
      return {
        isSuccess: false,
        message: "Popup not found",
      };
    }

    return {
      isSuccess: true,
      message: "Popup retrieved successfully",
      data: popup,
    };
  } catch (error) {
    console.error("[GET_POPUP_ERROR]", error);
    return {
      isSuccess: false,
      message: "Something went wrong",
    };
  }
}

// Get active popups for the frontend
export async function getActivePopups(): Promise<ActionState<Popup[]>> {
  try {
    const now = new Date();

    const popups = await prisma.popup.findMany({
      where: {
        active: true,
        OR: [
          {
            startDate: null,
            endDate: null,
          },
          {
            startDate: {
              lte: now,
            },
            endDate: {
              gte: now,
            },
          },
          {
            startDate: {
              lte: now,
            },
            endDate: null,
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      isSuccess: true,
      message: "Active popups retrieved successfully",
      data: popups,
    };
  } catch (error) {
    console.error("[GET_ACTIVE_POPUPS_ERROR]", error);
    return {
      isSuccess: false,
      message: "Something went wrong",
    };
  }
}
