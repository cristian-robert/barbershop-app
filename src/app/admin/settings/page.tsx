// Path: src/app/admin/settings/page.tsx
// Settings main page

import { Card } from "@/components/ui/card";
import { SettingsForm } from "./_components/settings-form";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card className="p-6">
        <SettingsForm />
      </Card>
    </div>
  );
}