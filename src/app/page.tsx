"use server";

import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarDays, Scissors } from "lucide-react";

export default async function HomePage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Barbershop
        </h1>
        <p className="text-xl text-muted-foreground">
          Professional haircuts and styling services
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-2">
        <Link href="/services" className="block">
          <div className="group relative rounded-lg border p-6 hover:bg-accent">
            <div className="flex items-center space-x-4">
              <Scissors className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">Our Services</h3>
                <p className="text-sm text-muted-foreground">
                  View our range of professional services
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/appointments" className="block">
          <div className="group relative rounded-lg border p-6 hover:bg-accent">
            <div className="flex items-center space-x-4">
              <CalendarDays className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">Book Appointment</h3>
                <p className="text-sm text-muted-foreground">
                  Schedule your next visit
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className="mx-auto mt-8 max-w-4xl text-center">
        <h2 className="text-2xl font-bold">Ready to get started?</h2>
        <p className="mt-2 text-muted-foreground">
          Book your appointment now and experience our professional services
        </p>
        <Button asChild className="mt-4">
          <Link href="/appointments">Book Now</Link>
        </Button>
      </div>
    </div>
  );
}
