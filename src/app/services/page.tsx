"use server";

import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ServiceCard } from "./_components/service-card";

const services = [
  {
    id: "1",
    name: "Haircut",
    description: "Professional haircut service with wash and style",
    duration: 30,
    price: 30.0,
    image: "/images/services/haircut.jpg",
  },
  {
    id: "2",
    name: "Beard Trim",
    description: "Professional beard trimming and shaping",
    duration: 20,
    price: 20.0,
    image: "/images/services/beard.jpg",
  },
  {
    id: "3",
    name: "Hair Color",
    description: "Professional hair coloring service",
    duration: 90,
    price: 80.0,
    image: "/images/services/color.jpg",
  },
];

export default async function ServicesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Services</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
