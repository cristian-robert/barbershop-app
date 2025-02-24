"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Service } from "@prisma/client";
import {
  getAvailableTimeSlots,
  TimeSlot,
  createAppointment,
} from "@/actions/appointment-actions";
import { parse, addDays, startOfDay } from "date-fns";

interface HomePageProps {
  services: Service[];
  userId?: string | null;
}

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

export default function HomePage({ services, userId }: HomePageProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>();
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service>();
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: "",
    email: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const { toast } = useToast();

  const fetchAvailableSlots = async (date: Date, serviceId: string) => {
    setIsFetchingSlots(true);
    try {
      // Ensure we're passing a properly formatted date string to the server action
      const result = await getAvailableTimeSlots(
        new Date(date.toISOString()),
        serviceId
      );
      if (result.isSuccess && result.data) {
        setAvailableSlots(result.data);
        return true;
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch available time slots",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
      toast({
        title: "Error",
        description: "Failed to fetch available time slots",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsFetchingSlots(false);
    }
  };

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setIsServiceDialogOpen(true);
    }
  };

  const handleServiceSelect = async (service: Service) => {
    setSelectedService(service);
    setIsServiceDialogOpen(false);
    if (selectedDate) {
      const success = await fetchAvailableSlots(selectedDate, service.id);
      if (success) {
        setIsTimeDialogOpen(true);
      }
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setIsTimeDialogOpen(false);
    setIsContactDialogOpen(true);
  };

  const handleContactInfoChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    const re = /^\+?[\d\s-]{10,}$/;
    return re.test(phone);
  };

  const handleAppointmentSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedService) {
      toast({
        title: "Missing Information",
        description: "Please select date, time and service",
        variant: "destructive",
      });
      return;
    }

    if (!contactInfo.name || !contactInfo.email || !contactInfo.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all contact information",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(contactInfo.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!validatePhone(contactInfo.phone)) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create appointment start and end times
      // Create a new date object from the selected date to ensure proper serialization
      const appointmentDate = new Date(selectedDate.toISOString());
      const [hours, minutes] = selectedTime.split(":").map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const endTime = new Date(appointmentDate.toISOString());
      endTime.setMinutes(endTime.getMinutes() + selectedService.duration);

      // Verify slot is still available
      const availabilityCheck = await fetchAvailableSlots(
        new Date(selectedDate.toISOString()),
        selectedService.id
      );

      if (!availabilityCheck) {
        toast({
          title: "Time Slot No Longer Available",
          description: "Please select a different time slot",
          variant: "destructive",
        });
        setIsContactDialogOpen(false);
        setIsTimeDialogOpen(true);
        return;
      }

      const result = await createAppointment({
        serviceId: selectedService.id,
        startTime: appointmentDate,
        endTime: endTime,
        guestName: contactInfo.name,
        guestEmail: contactInfo.email,
        guestPhone: contactInfo.phone,
      });

      if (result.isSuccess) {
        toast({
          title: "Success",
          description:
            "Appointment booked successfully! Check your email for confirmation.",
        });
        // Reset form
        setSelectedDate(undefined);
        setSelectedTime(undefined);
        setSelectedService(undefined);
        setContactInfo({ name: "", email: "", phone: "" });
        setIsContactDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disabledDates = {
    before: startOfDay(new Date()),
    after: addDays(new Date(), 30),
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Barbershop
        </h1>
        <p className="text-xl text-muted-foreground">
          Book your appointment in simple steps
        </p>
      </div>

      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Select a Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) =>
                date < disabledDates.before ||
                date > disabledDates.after ||
                date.getDay() === 0
              }
              className="mx-auto"
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a Service</DialogTitle>
            <DialogDescription>
              Choose from our available services
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 p-4">
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
        </DialogContent>
      </Dialog>

      <Dialog open={isTimeDialogOpen} onOpenChange={setIsTimeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Time</DialogTitle>
            <DialogDescription>
              Available time slots for {selectedDate?.toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          {isFetchingSlots ? (
            <div className="p-4 text-center">
              Loading available time slots...
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="p-4 text-center text-red-500">
              No available time slots for this date
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 p-4">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? "default" : "outline"}
                  className={!slot.available ? "bg-red-200" : ""}
                  disabled={!slot.available}
                  onClick={() => handleTimeSelect(slot.time)}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Your Contact Information</DialogTitle>
            <DialogDescription>
              We'll use this information to send you appointment confirmation
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 p-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full rounded-md border p-2"
                placeholder="Your name"
                value={contactInfo.name}
                onChange={(e) =>
                  handleContactInfoChange("name", e.target.value)
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-md border p-2"
                placeholder="Your email"
                value={contactInfo.email}
                onChange={(e) =>
                  handleContactInfoChange("email", e.target.value)
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                className="w-full rounded-md border p-2"
                placeholder="Your phone number"
                value={contactInfo.phone}
                onChange={(e) =>
                  handleContactInfoChange("phone", e.target.value)
                }
                required
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAppointmentSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Creating Appointment..." : "Confirm Appointment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
