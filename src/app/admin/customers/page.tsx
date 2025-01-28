// Path: src/app/admin/customers/page.tsx
// Customers main page

import { prisma } from "@/lib/db";
import { CustomerList } from "./_components/customer-list";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          appointments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Customers</h1>
      <CustomerList customers={customers} />
    </div>
  );
}