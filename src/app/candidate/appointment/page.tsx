
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Upload, CheckCircle, X, Loader2 } from 'lucide-react';
import { addDays, format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { FileUploadModal } from '@/components/file-upload-modal';
import { useUser, initializeFirebase } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

const wizardSteps = [
    { id: 1, name: 'Uploads' },
    { id: 2, name: 'Appointment' },
    { id: 3, name: 'Confirm' }
];

const documents = [
    { id: 'aadhaar', label: 'Aadhaar Card' },
    { id: 'pan', label: 'PAN Card' },
    { id: 'ssc', label: '10th Marksheet' },
    { id: 'hsc', label: '12th Marksheet' },
    { id: 'tc', label: 'Transfer Certificate' },
    { id: 'photo', label: 'Passport Photo' },
    { id: 'signature', label: 'Signature' },
];

// Mock data for available slots
const availableDates = [addDays(new Date(), 7), addDays(new Date(), 9), addDays(new Date(), 14)];
const timeSlotsByDate: Record<string, string[]> = {
    [format(availableDates[0], 'yyyy-MM-dd')]: ["09:30 AM - 12:30 PM", "01:30 PM - 04:30 PM"],
    [format(availableDates[1], 'yyyy-MM-dd')]: ["09:30 AM - 12:30 PM"],
    [format(availableDates[2], 'yyyy-MM-dd')]: ["09:30 AM - 12:30 PM", "01:30 PM - 04:30 PM"],
};


function AppointmentWizard() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useUser();
    const { firestore } = initializeFirebase();
    const { toast } = useToast();
    const applicationId = searchParams.get('applicationId');
    const [currentStep, setCurrentStep] = useState(1);
    
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, {name: string, url: string}>>({});
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [currentUploadDocId, setCurrentUploadDocId] = useState<string | null>(null);
    
    // State for Step 2
    const [appointmentDate, setAppointmentDate] = useState<Date | undefined>();
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
    const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
    
    // State for Step 3 (confirmation)
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);


    const handleFileUpload = (file: {name: string, url: string}) => {
        if(currentUploadDocId) {
            setUploadedFiles(prev => ({
                ...prev,
                [currentUploadDocId]: file,
            }));
        }
        setCurrentUploadDocId(null);
    }
    
    const openUploadModal = (docId: string) => {
        setCurrentUploadDocId(docId);
        setIsUploadModalOpen(true);
    }
    
    const allDocsUploaded = documents.every(docId => uploadedFiles[docId.id]);

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;
        const isAvailable = availableDates.some(d => isSameDay(d, date));
        if (isAvailable) {
            setAppointmentDate(date);
            setSelectedTimeSlot(null); // Reset time slot when date changes
            setAvailableTimeSlots(timeSlotsByDate[format(date, 'yyyy-MM-dd')] || []);
        } else {
            setAppointmentDate(undefined);
            setAvailableTimeSlots([]);
        }
    }

    const handleProceedToConfirmation = async () => {
        if (!user || !applicationId || !firestore || !appointmentDate || !selectedTimeSlot) {
             toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please select a date and time slot to proceed.',
            });
            return;
        }

        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                const appliedCourses = userData.appliedCourses || [];
                const courseIndex = appliedCourses.findIndex((c: any) => c.id === applicationId);

                if (courseIndex !== -1) {
                    appliedCourses[courseIndex].status = 'Appointment Booked';
                    appliedCourses[courseIndex].appointmentDate = appointmentDate.toISOString();
                    appliedCourses[courseIndex].appointmentTime = selectedTimeSlot;
                    
                    const documentsToSave = Object.entries(uploadedFiles).map(([docId, file]) => ({
                        id: docId,
                        label: documents.find(d => d.id === docId)?.label || 'Document',
                        url: file.url,
                        name: file.name,
                        status: 'Pending',
                        uploadedAt: new Date().toISOString(),
                    }));

                    appliedCourses[courseIndex].documents = documentsToSave;

                    await updateDoc(userDocRef, { appliedCourses });
                    setCurrentStep(3); // Move to confirmation step
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
         // This simulates the final step after payment would have been taken
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
                    <div className="flex items-center w-full max-w-md">
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
                         <h3 className="font-semibold text-lg">Step 1: Document Upload</h3>
                         <p className="text-sm text-muted-foreground">
                            Please upload all required documents for verification.
                         </p>
                         <div className="space-y-4 rounded-md border p-4">
                            {documents.map(doc => {
                                return (
                                    <div key={doc.id} className="flex items-center justify-between">
                                        <Label htmlFor={doc.id} className="font-medium">{doc.label}</Label>
                                        <div className="flex items-center gap-2">
                                            <Button type="button" variant="outline" size="sm" onClick={() => openUploadModal(doc.id)}>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload
                                            </Button>
                                            {uploadedFiles[doc.id] ? (
                                                 <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4"/> {uploadedFiles[doc.id].name}</span>
                                            ) : (
                                                 <span className="text-xs text-red-600">Required</span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                         </div>

                         <div className="flex justify-end mt-8">
                             <Button onClick={() => setCurrentStep(2)} disabled={!allDocsUploaded}>Next: Select Appointment</Button>
                        </div>
                    </div>
                 )}

                 {currentStep === 2 && (
                     <div className="space-y-6">
                         <h3 className="font-semibold text-lg">Step 2: Choose Appointment Slot</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="font-medium">Select a Date</h4>
                                <Calendar
                                    mode="single"
                                    selected={appointmentDate}
                                    onSelect={handleDateSelect}
                                    disabled={(date) => date < new Date() && !isSameDay(date, new Date())}
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
                                <p className="text-xs text-muted-foreground text-center">Dates in blue are available.</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-medium">Select a Time Slot</h4>
                                {appointmentDate ? (
                                    availableTimeSlots.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-2">
                                            {availableTimeSlots.map(slot => (
                                                <Button 
                                                    key={slot}
                                                    variant={selectedTimeSlot === slot ? 'default' : 'outline'}
                                                    onClick={() => setSelectedTimeSlot(slot)}
                                                >
                                                    {slot}
                                                </Button>
                                            ))}
                                        </div>
                                    ) : (
                                         <p className="text-sm text-muted-foreground text-center pt-8">No time slots available for this date.</p>
                                    )
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center pt-8">Please select an available date to see time slots.</p>
                                )}
                            </div>
                         </div>
                          <div className="flex justify-between items-center mt-8">
                            <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                            <Button onClick={handleProceedToConfirmation} disabled={!selectedTimeSlot}>Book Appointment</Button>
                        </div>
                    </div>
                 )}
                 
                 {currentStep === 3 && (
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
        
        {currentUploadDocId && (
            <FileUploadModal 
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                title={`Upload ${documents.find(d => d.id === currentUploadDocId)?.label}`}
                onFileUpload={handleFileUpload}
            />
        )}
        
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

    