// Path: src/app/admin/layout.tsx
// This is your admin layout - it should include the AdminSidebar
import { AdminSidebar } from "./_components/admin-sidebar";
import { checkAdmin } from "@/lib/auth-utils";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await checkAdmin();

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="flex-1 space-y-4 p-8 pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}