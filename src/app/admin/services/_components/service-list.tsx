// Path: src/app/admin/services/_components/service-list.tsx
"use client";

import { Service } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ServiceListProps {
  services: Service[];
  onEdit: (service: Service) => void;
}

export function ServiceList({ services, onEdit }: ServiceListProps) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/services/${id}`);
      toast.success("Service deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell>
                {service.image ? (
                  <div className="relative h-10 w-10">
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-md bg-gray-100" />
                )}
              </TableCell>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell>{service.duration} mins</TableCell>
              <TableCell>${service.price.toFixed(2)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onEdit(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-destructive"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}