"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Service } from "@prisma/client";
import { createAppointment } from "@/actions/appointment-actions";
import { useToast } from "@/components/ui/use-toast";
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
import { useEffect } from "react";

interface AppointmentCalendarProps {
  services: Service[];
}

export function AppointmentCalendar({ services }: AppointmentCalendarProps) {
  const [date, setDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Debug logging
  console.log("Current State:", {
    date,
    selectedTime,
    selectedService,
    guestName,
    guestEmail,
    guestPhone,
  });

  // Available time slots (you can modify these)
  const timeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
  ];

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

  useEffect(() => {
    console.log("Current state:", {
      date,
      selectedTime,
      selectedService,
    });
  }, [date, selectedTime, selectedService]);

  return (
    <div className="space-y-4">
      {/* Services Selection */}
      <div className="grid gap-2">
        <h3 className="font-medium">Select Service</h3>
        <div className="grid gap-2">
          {services.map((service) => (
            <Button
              key={service.id}
              variant={
                selectedService?.id === service.id ? "default" : "outline"
              }
              className="w-full justify-start"
              onClick={() => {
                setSelectedService(service);
                console.log("Service selected:", service);
              }}
            >
              <div className="flex justify-between w-full">
                <span>{service.name}</span>
                <span>${service.price}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Date Selection */}
      <div className="grid gap-2">
        <h3 className="font-medium">Select Date</h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            console.log("Date selected:", date);
            setSelectedDate(date);
          }}
          disabled={(date) => date < new Date() || date.getDay() === 0}
          className="mx-auto"
        />
      </div>

      {/* Time Selection */}
      <div className="grid gap-2">
        <h3 className="font-medium">Select Time</h3>
        <div className="grid grid-cols-4 gap-2">
          {timeSlots.map((time) => (
            <Button
              key={time}
              variant={selectedTime === time ? "default" : "outline"}
              onClick={() => {
                setSelectedTime(time);
                console.log("Time selected:", time);
              }}
            >
              {time}
            </Button>
          ))}
        </div>
      </div>

      {/* Guest Information */}
      <div className="grid gap-2">
        <h3 className="font-medium">Your Information</h3>
        <input
          type="text"
          placeholder="Name"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="tel"
          placeholder="Phone"
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Book Button */}
      <Button
        className="w-full"
        disabled={!date || !selectedTime || !selectedService}
        onClick={handleBookAppointment}
      >
        {!date
          ? "Please select a date"
          : !selectedService
          ? "Please select a service"
          : !selectedTime
          ? "Please select a time"
          : "Book Appointment"}
      </Button>
    </div>
  );
}
