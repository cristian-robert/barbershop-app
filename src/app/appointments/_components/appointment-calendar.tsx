"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { add, format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Service } from "@prisma/client";
import { createAppointment } from "@/actions/appointment-actions";

interface AppointmentCalendarProps {
  services: Service[];
}

export function AppointmentCalendar({ services }: AppointmentCalendarProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = React.useState<string>("");
  const [selectedService, setSelectedService] = React.useState<Service>();
  const [guestName, setGuestName] = React.useState("");
  const [guestEmail, setGuestEmail] = React.useState("");
  const [guestPhone, setGuestPhone] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  // Generate available time slots based on service duration
  const getAvailableTimeSlots = React.useCallback(() => {
    if (!selectedService) return [];

    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    const duration = selectedService.duration;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += duration) {
        if (hour === endHour - 1 && minute + duration > 60) continue;
        slots.push(
          `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`
        );
      }
    }

    return slots;
  }, [selectedService]);

  const handleBookAppointment = async () => {
    if (!date || !selectedTime || !selectedService) {
      toast({
        title: "Error",
        description: "Please select date, time and service",
        variant: "destructive",
      });
      return;
    }

    if (!guestName || !guestEmail || !guestPhone) {
      toast({
        title: "Error",
        description: "Please fill in all contact information",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + selectedService.duration);

    try {
      const result = await createAppointment({
        serviceId: selectedService.id,
        startTime,
        endTime,
        guestName,
        guestEmail,
        guestPhone,
      });

      if (result.isSuccess) {
        toast({
          title: "Success",
          description: "Appointment booked successfully!",
        });
        // Reset form
        setSelectedTime("");
        setGuestName("");
        setGuestEmail("");
        setGuestPhone("");
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {services.map((service) => (
          <Button
            key={service.id}
            variant={selectedService?.id === service.id ? "default" : "outline"}
            className={cn(
              "w-full justify-start px-4 py-6",
              selectedService?.id === service.id &&
                "bg-primary text-primary-foreground"
            )}
            onClick={() => setSelectedService(service)}
          >
            <div className="text-left">
              <div className="font-semibold">{service.name}</div>
              <div className="text-sm opacity-90">
                {service.duration} min • ${service.price}
              </div>
            </div>
          </Button>
        ))}
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          disabled={(date) => date < new Date()}
        />

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {getAvailableTimeSlots().map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                className={cn(
                  "w-full",
                  selectedTime === time && "bg-primary text-primary-foreground"
                )}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </Button>
            ))}
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="w-full"
                disabled={!date || !selectedTime || !selectedService}
              >
                Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Book Appointment</DialogTitle>
                <DialogDescription>
                  Please provide your contact information below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="service" className="text-right">
                    Service
                  </Label>
                  <Input
                    id="service"
                    value={selectedService?.name}
                    className="col-span-3"
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="date"
                    value={date ? format(date, "PPP") : ""}
                    className="col-span-3"
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">
                    Time
                  </Label>
                  <Input
                    id="time"
                    value={selectedTime}
                    className="col-span-3"
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleBookAppointment} disabled={isLoading}>
                  {isLoading ? "Booking..." : "Confirm Booking"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
