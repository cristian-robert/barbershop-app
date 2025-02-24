// src/app/admin/settings/page.tsx
import { getSiteSettings } from "@/actions/site-settings-actions";
import { SettingsForm } from "./_components/settings-form";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default async function SettingsPage() {
  const settingsResult = await getSiteSettings();
  const initialSettings = settingsResult.isSuccess
    ? settingsResult.data
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline">Preview Site</Button>
          <Button variant="default">Publish Changes</Button>
        </div>
      </div>

      {!settingsResult.isSuccess && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {settingsResult.message || "Failed to load settings"}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <SettingsForm initialData={initialSettings} />
        </div>
      </div>
    </div>
  );
}
