import { prisma } from "@/lib/db";
import HomePage from "@/components/home";
import { auth } from "@clerk/nextjs";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function HomePageLoader() {
  try {
    const { userId } = auth();

    const services = await prisma.service.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
        price: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!services || services.length === 0) {
      throw new Error("No services found");
    }

    return <HomePage services={services} userId={userId} />;
  } catch (error) {
    console.error("Error loading home page:", error);
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">
            Error loading services
          </h1>
          <p className="mt-2 text-gray-600">
            Please try again later or contact support
          </p>
        </div>
      </div>
    );
  }
}

export default async function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl">Loading...</h1>
              <p className="mt-2 text-gray-600">Please wait</p>
            </div>
          </div>
        }
      >
        <HomePageLoader />
      </Suspense>
    </div>
  );
}
