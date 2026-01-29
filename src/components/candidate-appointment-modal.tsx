
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { addDays, isSameDay } from 'date-fns';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AppliedCourse {
  id: string;
  applicationId: string;
  courseCategory: string;
  lastUpdated: string;
  amount: string;
  date: string;
  status: 'Pending' | 'Appointment Booked' | 'Verified' | 'Rejected';
  appointmentDate?: string;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: AppliedCourse;
  onBookAppointment: (courseId: string, date: Date) => void;
}

// Simulate fetching available dates from the admin
const availableDates = [addDays(new Date(), 7), addDays(new Date(), 9), addDays(new Date(), 14)];

export function AppointmentModal({ isOpen, onClose, course, onBookAppointment }: AppointmentModalProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const { toast } = useToast();

    const handleConfirmBooking = () => {
        if (!selectedDate) {
            toast({
                variant: 'destructive',
                title: 'No Date Selected',
                description: 'Please select an available date from the calendar.',
            });
            return;
        }
        onBookAppointment(course.id, selectedDate);
        onClose();
    };

    const isDateAvailable = (date: Date) => {
        return availableDates.some(availableDate => isSameDay(date, availableDate));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] p-0">
                <DialogHeader className="p-4 bg-primary text-primary-foreground flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CalendarIcon />
                        <DialogTitle>Book Verification Appointment</DialogTitle>
                    </div>
                    <DialogClose asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-primary/80">
                        <X className="h-4 w-4" />
                        </Button>
                    </DialogClose>
                </DialogHeader>
                <div className="p-6">
                    <p className="text-sm text-muted-foreground mb-4">
                        Select an available date for your document verification for application: <span className="font-bold text-foreground">{course.applicationId}</span>
                    </p>
                    <div className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date() || !isDateAvailable(date)}
                            className="rounded-md border"
                        />
                    </div>
                     <p className="text-xs text-center text-muted-foreground mt-2">Only highlighted dates are available.</p>
                </div>
                <DialogFooter className="p-4 border-t">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirmBooking} disabled={!selectedDate}>
                        Confirm Appointment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
