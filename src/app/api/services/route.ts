// Path: src/app/api/services/route.ts
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const isAdminUser = await isAdmin();
    if (!isAdminUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const service = await prisma.service.create({
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
    console.error("[SERVICES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}