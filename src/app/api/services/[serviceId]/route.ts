// Path: src/app/api/services/[serviceId]/route.ts
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const isAdminUser = await isAdmin();
    if (!isAdminUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const service = await prisma.service.update({
      where: {
        id: params.serviceId,
      },
      data: {
        name: body.name,
        description: body.description,
        duration: parseInt(body.duration),
        price: parseFloat(body.price),
        image: body.image,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("[SERVICE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const isAdminUser = await isAdmin();
    if (!isAdminUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const service = await prisma.service.delete({
      where: {
        id: params.serviceId,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("[SERVICE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}