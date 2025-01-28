// Path: src/app/admin/services/page.tsx
"use client";

import { prisma } from "@/lib/db";
import { ServiceList } from "./_components/service-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ServiceModal } from "./_components/service-modal";

export default function AdminServicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | undefined>(undefined);

  const onAddService = () => {
    setSelectedService(undefined);
    setIsModalOpen(true);
  };

  const onEditService = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const services = await prisma.service.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Services</h1>
        <Button onClick={onAddService}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>
      <ServiceList 
        services={services} 
        onEdit={onEditService}
      />
      <ServiceModal 
        initialData={selectedService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}