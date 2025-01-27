"use client";

import { Button } from "@/components/ui/button";
import { getGoogleAuthUrl } from "@/lib/google-calendar";
import { useRouter } from "next/navigation";

export default function GoogleCalendarButton() {
  const router = useRouter();

  const handleConnect = () => {
    const authUrl = getGoogleAuthUrl();
    router.push(authUrl);
  };

  return (
    <Button onClick={handleConnect} variant="outline" className="mb-4">
      Connect Google Calendar
    </Button>
  );
}
