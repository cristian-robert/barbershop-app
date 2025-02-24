"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import {
  ActionState,
  CreateMediaAssetInput,
  MediaAsset,
  UpdateMediaAssetInput,
} from "@/types";
import { revalidatePath } from "next/cache";

export async function createMediaAsset(
  input: CreateMediaAssetInput
): Promise<ActionState<MediaAsset>> {
  try {
    const { userId } = auth();

    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        ...input,
      },
    });

    revalidatePath("/admin/media");

    return {
      isSuccess: true,
      message: "Media asset created successfully",
      data: mediaAsset,
    };
  } catch (error) {
    console.error("[CREATE_MEDIA_ASSET_ERROR]", error);
    return {
      isSuccess: false,
      message: "Something went wrong",
    };
  }
}

export async function updateMediaAsset(
  input: UpdateMediaAssetInput
): Promise<ActionState<MediaAsset>> {
  try {
    const { userId } = auth();

    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const mediaAsset = await prisma.mediaAsset.update({
      where: { id: input.id },
      data: {
        name: input.name,
        type: input.type,
        url: input.url,
        thumbnailUrl: input.thumbnailUrl,
        size: input.size,
        mimeType: input.mimeType,
        alt: input.alt,
      },
    });

    revalidatePath("/admin/media");

    return {
      isSuccess: true,
      message: "Media asset updated successfully",
      data: mediaAsset,
    };
  } catch (error) {
    console.error("[UPDATE_MEDIA_ASSET_ERROR]", error);
    return {
      isSuccess: false,
      message: "Something went wrong",
    };
  }
}

export async function deleteMediaAsset(
  id: string
): Promise<ActionState<MediaAsset>> {
  try {
    const { userId } = auth();

    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const mediaAsset = await prisma.mediaAsset.delete({
      where: { id },
    });

    revalidatePath("/admin/media");

    return {
      isSuccess: true,
      message: "Media asset deleted successfully",
      data: mediaAsset,
    };
  } catch (error) {
    console.error("[DELETE_MEDIA_ASSET_ERROR]", error);
    return {
      isSuccess: false,
      message: "Something went wrong",
    };
  }
}

export async function getMediaAssets(): Promise<ActionState<MediaAsset[]>> {
  try {
    const { userId } = auth();

    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const mediaAssets = await prisma.mediaAsset.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      isSuccess: true,
      message: "Media assets retrieved successfully",
      data: mediaAssets,
    };
  } catch (error) {
    console.error("[GET_MEDIA_ASSETS_ERROR]", error);
    return {
      isSuccess: false,
      message: "Something went wrong",
    };
  }
}

export async function getMediaAsset(
  id: string
): Promise<ActionState<MediaAsset>> {
  try {
    const { userId } = auth();

    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const mediaAsset = await prisma.mediaAsset.findUnique({
      where: { id },
    });

    if (!mediaAsset) {
      return {
        isSuccess: false,
        message: "Media asset not found",
      };
    }

    return {
      isSuccess: true,
      message: "Media asset retrieved successfully",
      data: mediaAsset,
    };
  } catch (error) {
    console.error("[GET_MEDIA_ASSET_ERROR]", error);
    return {
      isSuccess: false,
      message: "Something went wrong",
    };
  }
}
