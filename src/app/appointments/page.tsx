"use server";

import { redirect } from "next/navigation";

export default async function AppointmentsPage() {
  // Redirect to home page since we've consolidated the booking flow there
  redirect("/");
}
