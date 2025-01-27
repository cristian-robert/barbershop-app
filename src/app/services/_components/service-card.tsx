"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    image: string;
  };
}

export function ServiceCard({ service }: ServiceCardProps) {
  const router = useRouter();

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <Image
          src={service.image}
          alt={service.name}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader>
        <CardTitle>{service.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{service.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-lg font-semibold">${service.price}</p>
          <p className="text-sm text-muted-foreground">
            {service.duration} min
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={() => router.push(`/appointments?service=${service.id}`)}
        >
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
}
