
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, CheckCircle, Loader2, X } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useUser, initializeFirebase } from '@/firebase';
import { doc, getDoc, updateDoc, collection, query, where, Timestamp, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const wizardSteps = [
    { id: 1, name: 'Appointment' },
    { id: 2, name: 'Confirm' }
];

type AppliedCourse = {
  id: string;
  applicationId: string;
  courseCategory: string; // Course Name
  lastUpdated: string; // This is the payment date
  [key: string]: any; // Allow other properties
};

function AppointmentWizard() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useUser();
    const { firestore } = initializeFirebase();
    const { toast } = useToast();
    const applicationId = searchParams.get('applicationId');

    const [currentStep, setCurrentStep] = useState(1);
    const [courseData, setCourseData] = useState<AppliedCourse | null>(null);
    const [userData, setUserData] = useState<any>(null);
    
    const [appointmentDate, setAppointmentDate] = useState<Date | undefined>();
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
    
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

    const [availableDates, setAvailableDates] = useState<Date[]>([]);
    const [timeSlotsByDate, setTimeSlotsByDate] = useState<Record<string, string[]>>({});
    const [slotsLoading, setSlotsLoading] = useState(true);

    // Fetch available slots in real-time
    useEffect(() => {
        if (!firestore) return;
        setSlotsLoading(true);
        const slotsCollection = collection(firestore, 'appointment_slots');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const q = query(slotsCollection, where('date', '>=', Timestamp.fromDate(today)));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const dates: Date[] = [];
            const slotsData: Record<string, string[]> = {};
            
            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.slots && data.slots.length > 0) {
                    const date = data.date.toDate();
                    dates.push(date);
                    slotsData[format(date, 'yyyy-MM-dd')] = data.slots;
                }
            });
            
            setAvailableDates(dates);
            setTimeSlotsByDate(slotsData);
            setSlotsLoading(false);
        }, (error) => {
            console.error("Error fetching appointment slots: ", error);
            setSlotsLoading(false);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not fetch appointment slots.',
            });
        });

        return () => unsubscribe();
    }, [firestore, toast]);
    
    // Fetch course and user data
    useEffect(() => {
      if (user && firestore && applicationId) {
        const fetchCourseData = async () => {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const fetchedUserData = userDocSnap.data();
            setUserData(fetchedUserData);
            const appliedCourse = (fetchedUserData.appliedCourses || []).find((c: any) => c.id === applicationId);
            if (appliedCourse) {
              setCourseData(appliedCourse);
              const paymentDate = new Date(appliedCourse.lastUpdated);
              // Set the calendar to the month of payment
              setAppointmentDate(paymentDate); 
            } else {
              toast({ variant: 'destructive', title: 'Error', description: 'Application not found.' });
              router.push('/candidate/apply');
            }
          }
        };
        fetchCourseData();
      }
    }, [user, firestore, applicationId, router, toast]);

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;
        const isAvailable = availableDates.some(d => isSameDay(d, date));
        if (isAvailable) {
            setAppointmentDate(date);
            setSelectedTimeSlot(null);
        } else {
            // Keep the month view but don't select the date
            setAppointmentDate(date);
            setSelectedTimeSlot(null);
            toast({ variant: 'destructive', title: 'Date Not Available', description: 'Please select a highlighted date.'});
        }
    }
    
    const compileDocumentsFromProfile = () => {
        if (!userData) return [];

        const documentsToSave: any[] = [];
        const addDoc = (id: string, label: string, url: string | undefined, name: string) => {
            if (url) {
                documentsToSave.push({ id, label, url, name, status: 'Pending', uploadedAt: new Date().toISOString() });
            }
        };

        addDoc('photo', 'Passport Photo', userData.photoUrl, 'photo.jpg');
        addDoc('signature', 'Signature', userData.signUrl, 'signature.jpg');
        addDoc('domicile', 'Domicile Certificate', userData.domicileFileUrl, 'domicile.jpg');
        addDoc('disability', 'Disability Certificate', userData.disabilityCertFileUrl, 'disability.jpg');
        addDoc('caste', 'Caste Certificate', userData.casteCertFileUrl, 'caste.jpg');
        addDoc('caste_validity', 'Caste Validity Certificate', userData.casteValidityCertFileUrl, 'caste_validity.jpg');

        (userData.qualifications || []).forEach((q: any, index: number) => {
            addDoc(`qualification-${index}`, `${q.examination} Marksheet`, q.marksheetUrl, `marksheet_${index}.jpg`);
        });

        (userData.experiences || []).forEach((exp: any, index: number) => {
            addDoc(`experience-${index}`, `${exp.organization} Experience Letter`, exp.certificateUrl, `experience_${index}.jpg`);
        });

        return documentsToSave;
    }

    const handleProceedToConfirmation = async () => {
        if (!user || !applicationId || !firestore || !appointmentDate || !selectedTimeSlot) {
             toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please select an available date and time slot to proceed.',
            });
            return;
        }

        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const currentData = userDoc.data();
                const appliedCourses = currentData.appliedCourses || [];
                const courseIndex = appliedCourses.findIndex((c: any) => c.id === applicationId);

                if (courseIndex !== -1) {
                    appliedCourses[courseIndex].status = 'Appointment Booked';
                    appliedCourses[courseIndex].appointmentDate = appointmentDate.toISOString();
                    appliedCourses[courseIndex].appointmentTime = selectedTimeSlot;
                    appliedCourses[courseIndex].documents = compileDocumentsFromProfile();

                    await updateDoc(userDocRef, { appliedCourses });
                    setCurrentStep(2); // Move to confirmation step
                }
            }
        } catch (error) {
            console.error("Error booking appointment:", error);
            toast({
                variant: 'destructive',
                title: 'Booking Failed',
                description: 'Could not save the appointment. Please try again.',
            });
        }
    }
    
    const handleFinalConfirmation = () => {
        setShowPaymentSuccess(true);
    }

    const handleCloseSuccessPopup = () => {
        setShowPaymentSuccess(false);
        router.push('/candidate/apply');
    }


    return (
        <>
        <Card>
            <CardHeader>
                <CardTitle className="text-xl text-primary">
                    Appointment for Application: {applicationId}
                </CardTitle>
                 <div className="flex items-center justify-center pt-4">
                    <div className="flex items-center w-full max-w-sm">
                    {wizardSteps.map((step, index) => (
                        <div key={step.id} className="flex items-center w-full">
                        <div className="flex flex-col items-center">
                            <div
                            className={cn(
                                'flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0',
                                step.id === currentStep
                                ? 'bg-primary text-white border-primary'
                                : 'bg-gray-200 border-gray-300',
                                step.id < currentStep ? 'bg-green-500 border-green-600 text-white' : ''
                            )}
                            >
                            {step.id}
                            </div>
                            <p className="text-xs mt-1 text-center">{step.name}</p>
                        </div>
                        {index < wizardSteps.length - 1 && (
                            <div
                            className={cn(
                                'flex-auto border-t-2',
                                step.id < currentStep ? 'border-green-500' : 'border-gray-300'
                            )}
                            ></div>
                        )}
                        </div>
                    ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 {currentStep === 1 && (
                     <div className="space-y-6">
                         <h3 className="font-semibold text-lg">Step 1: Choose Appointment Slot</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="font-medium">Select a Date</h4>
                                {slotsLoading ? (
                                    <div className="flex justify-center items-center rounded-md border h-[290px]"><Loader2 className="h-8 w-8 animate-spin" /></div>
                                ) : (
                                    <Calendar
                                        mode="single"
                                        month={appointmentDate}
                                        onMonthChange={setAppointmentDate}
                                        selected={availableDates.find(d => isSameDay(d, appointmentDate || new Date(0)))}
                                        onSelect={handleDateSelect}
                                        disabled={(date) => {
                                            const today = new Date();
                                            today.setHours(0,0,0,0);
                                            if (date < today) return true;
                                            return !availableDates.some(d => isSameDay(d, date));
                                        }}
                                        modifiers={{
                                            available: availableDates,
                                        }}
                                        modifiersStyles={{
                                            available: {
                                                color: 'hsl(var(--primary-foreground))',
                                                backgroundColor: 'hsl(var(--primary))',
                                            },
                                        }}
                                        className="rounded-md border justify-center flex"
                                    />
                                )}
                                <p className="text-xs text-muted-foreground text-center">Dates in blue are available.</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-medium">Select a Time Slot</h4>
                                {appointmentDate && timeSlotsByDate[format(appointmentDate, 'yyyy-MM-dd')] ? (
                                    slotsLoading ? (
                                        <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin"/></div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2">
                                            {timeSlotsByDate[format(appointmentDate, 'yyyy-MM-dd')].map(slot => (
                                                <Button 
                                                    key={slot}
                                                    variant={selectedTimeSlot === slot ? 'default' : 'outline'}
                                                    onClick={() => setSelectedTimeSlot(slot)}
                                                >
                                                    {slot}
                                                </Button>
                                            ))}
                                        </div>
                                    )
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center pt-8">Please select an available date to see time slots.</p>
                                )}
                            </div>
                         </div>
                          <div className="flex justify-between items-center mt-8">
                            <Button variant="outline" onClick={() => router.push('/candidate/apply')}>Back to Applications</Button>
                            <Button onClick={handleProceedToConfirmation} disabled={!selectedTimeSlot}>Book Appointment</Button>
                        </div>
                    </div>
                 )}
                 
                 {currentStep === 2 && (
                     <div className="space-y-6 text-center">
                         <CheckCircle className="text-green-500 h-16 w-16 mx-auto mb-4" />
                         <h3 className="font-semibold text-lg">Appointment Booked!</h3>
                         <p className="text-muted-foreground">Your appointment has been successfully booked. You will receive a notification once it is reviewed by the staff.</p>
                         <p>Date: <span className="font-bold">{appointmentDate ? format(appointmentDate, 'PPP') : 'N/A'}</span></p>
                         <p>Time: <span className="font-bold">{selectedTimeSlot}</span></p>
                         <div className="flex justify-center gap-4 pt-4">
                            <Button onClick={handleFinalConfirmation}>Pay Verification Fees</Button>
                            <Button variant="outline" onClick={() => router.push('/candidate/apply')}>Go to Applications</Button>
                         </div>
                    </div>
                 )}
            </CardContent>
        </Card>
        
        {showPaymentSuccess && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-xl p-8 text-center flex flex-col items-center relative">
                    <button onClick={handleCloseSuccessPopup} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
                        <X size={20} />
                    </button>
                    <CheckCircle className="text-green-500 h-16 w-16 mb-4" />
                    <h3 className="text-xl font-bold text-gray-800">Payment Successful!</h3>
                    <p className="text-muted-foreground mt-2">Your appointment request has been sent to the staff for review.</p>
                    <Button onClick={handleCloseSuccessPopup} className="mt-6">Close</Button>
                </div>
            </div>
        )}
        </>
    )
}

export default function AppointmentPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <AppointmentWizard />
      </Suspense>
    </div>
  );
}
