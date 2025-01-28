// Path: src/app/admin/services/_components/service-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServiceForm } from "./service-form";
import { Service } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

interface ServiceModalProps {
  initialData?: Service;
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceModal({ initialData, isOpen, onClose }: ServiceModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit Service" : "Create Service";
  const action = initialData ? "Save changes" : "Create";

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/services/${initialData.id}`, data);
        toast.success("Service updated successfully");
      } else {
        await axios.post("/api/services", data);
        toast.success("Service created successfully");
      }
      router.refresh();
      onClose();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ServiceForm 
          initialData={initialData} 
          onSubmit={onSubmit} 
          disabled={loading}
        />
      </DialogContent>
    </Dialog>
  );
}