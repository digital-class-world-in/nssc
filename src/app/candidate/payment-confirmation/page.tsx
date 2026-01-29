
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, initializeFirebase } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState, Suspense } from 'react';
import { useToast } from '@/hooks/use-toast';
import Script from 'next/script';

const DetailRow = ({ label, value }: { label: string; value: string | undefined }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 border-b last:border-b-0 px-6">
    <p className="text-md font-medium text-gray-600 w-full sm:w-1/3">{label}:</p>
    <p className="text-md font-semibold text-gray-800 w-full sm:w-2/3 mt-1 sm:mt-0">{value || '-'}</p>
  </div>
);

function PaymentConfirmationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: userLoading } = useUser();
    const { firestore } = initializeFirebase();
    const [userData, setUserData] = useState<any>(null);
    const [courseData, setCourseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const courseId = searchParams.get('courseId');

    useEffect(() => {
        if (user && firestore && courseId) {
            const fetchUserData = async () => {
                const docRef = doc(firestore, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData(data);
                    const appliedCourse = data.appliedCourses?.find((c: any) => c.id === courseId);
                    setCourseData(appliedCourse);
                }
                setLoading(false);
            };
            fetchUserData();
        } else if (!userLoading) {
            setLoading(false);
        }
    }, [user, userLoading, firestore, courseId]);

    const handleProceed = async () => {
        try {
            const response = await fetch('/api/create-razorpay-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount: courseData.amount }),
            });

            if (!response.ok) {
                throw new Error('Failed to create Razorpay order');
            }

            const order = await response.json();
            const fullName = [userData.firstName, userData.middleName, userData.lastName].filter(Boolean).join(' ');

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'National Skills Sector Councils',
                description: `Fee for ${courseData.courseCategory}`,
                order_id: order.id,
                modal: {
                    ondismiss: () => {
                        toast({
                            variant: "destructive",
                            title: "Payment Failed",
                            description: "Please try again.",
                        });
                    }
                },
                handler: async function (response: any) {
                    if (!user || !firestore || !courseId) return;

                    const userDocRef = doc(firestore, 'users', user.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const currentData = userDocSnap.data();
                        const updatedCourses = currentData.appliedCourses.map((c: any) =>
                            c.id === courseId ? { ...c, paymentStatus: 'Paid', paymentId: response.razorpay_payment_id, lastUpdated: new Date().toISOString() } : c
                        );
                        await updateDoc(userDocRef, { appliedCourses: updatedCourses });
                        
                        router.push(`/candidate/apply?payment=success&courseId=${courseId}`);
                    }
                },
                prefill: {
                    name: fullName,
                    email: userData.email,
                    contact: userData.primaryMobile,
                },
                theme: {
                    color: '#2FBDB7',
                },
            };
            // @ts-ignore
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Payment Failed',
                description: 'Could not initiate payment. Please try again.',
            });
        }
    }

    const handleDownloadSlip = () => {
        window.print();
    }
    
    if(loading || userLoading) {
        return <div className="flex justify-center p-8">Loading payment details...</div>
    }
    
    if(!user || !userData || !courseData) {
        return <div className="flex justify-center p-8">Could not load application information.</div>
    }

    const fullName = [userData.firstName, userData.middleName, userData.lastName].filter(Boolean).join(' ');

    const applicationData = {
        name: fullName.toUpperCase(),
        applicationId: courseData.applicationId,
        admissionSession: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        courseType: courseData.courseCategory,
        fee: courseData.amount
    };

  return (
    <>
    <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
    />
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex justify-center">
      <Card className="w-full max-w-4xl shadow-lg font-ui">
        <CardContent className="p-0">
          <div className="bg-white rounded-lg">
             <div className="p-6 space-y-4">
                <DetailRow label="Candidate's Name" value={applicationData.name} />
                <DetailRow label="Application ID" value={applicationData.applicationId} />
                <DetailRow label="Admission Session" value={applicationData.admissionSession} />
                <DetailRow label="Course Type" value={applicationData.courseType} />
                <DetailRow label="Application Form Fee" value={`₹ ${applicationData.fee}`} />
            </div>
            <div className="flex justify-center items-center p-6 gap-4">
                <Button onClick={handleProceed} className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-6">
                Proceed &gt;&gt;&gt;
                </Button>
                 <Button onClick={handleDownloadSlip} variant="outline" className="font-bold text-lg px-8 py-6">
                    Download Slip
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}


export default function PaymentConfirmationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentConfirmationContent />
        </Suspense>
    )
}
