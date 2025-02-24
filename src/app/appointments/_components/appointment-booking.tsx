"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Service } from "@prisma/client";
import { createAppointment } from "@/actions/appointment-actions";
import { useToast } from "@/components/ui/use-toast";

const AVAILABLE_TIMES = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

interface BookingProps {
  services: Service[];
}

export function AppointmentBooking({ services }: BookingProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const selectedDate = searchParams.get("date");
  const [selectedTime, setSelectedTime] = useState<string>();
  const [selectedService, setSelectedService] = useState<Service>();
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [step, setStep] = useState(1);

  if (!selectedDate) {
    router.push("/");
    return null;
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(2);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(3);
  };

  const handleBooking = async () => {
    if (!selectedTime || !selectedService || !selectedDate) return;

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + selectedService.duration);

    try {
      const result = await createAppointment({
        serviceId: selectedService.id,
        startTime,
        endTime,
        guestName: customerInfo.name,
        guestEmail: customerInfo.email,
        guestPhone: customerInfo.phone,
      });

      if (result.isSuccess) {
        toast({
          title: "Success",
          description: "Appointment booked successfully!",
        });
        router.push("/appointments/success");
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Select a Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_TIMES.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Choose a Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {services.map((service) => (
                <Button
                  key={service.id}
                  variant={
                    selectedService?.id === service.id ? "default" : "outline"
                  }
                  className="w-full justify-between"
                  onClick={() => handleServiceSelect(service)}
                >
                  <span>{service.name}</span>
                  <span>${service.price}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                className="w-full p-2 border rounded"
                value={customerInfo.name}
                onChange={(e) =>
                  setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-2 border rounded"
                value={customerInfo.email}
                onChange={(e) =>
                  setCustomerInfo((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
              <input
                type="tel"
                placeholder="Phone"
                className="w-full p-2 border rounded"
                value={customerInfo.phone}
                onChange={(e) =>
                  setCustomerInfo((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
              />
              <Button
                className="w-full"
                onClick={handleBooking}
                disabled={
                  !customerInfo.name ||
                  !customerInfo.email ||
                  !customerInfo.phone
                }
              >
                Book Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
      </div>
    </div>
  );
}
