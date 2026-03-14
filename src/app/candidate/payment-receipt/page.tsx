
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser, initializeFirebase } from '@/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';
import { NsscLogo } from '@/components/nssc-logo';
import { format } from 'date-fns';

// DetailItem component for styling
const DetailItem = ({ label, value }: { label: string; value: any }) => (
  <div className="grid grid-cols-2 gap-2 py-1.5">
    <p className="text-sm font-semibold text-gray-600">{label}</p>
    <p className="text-sm">{value || '-'}</p>
  </div>
);


function PaymentReceiptContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user: authUser, loading: authLoading } = useUser();
    const { firestore } = initializeFirebase();
    const courseId = searchParams.get('courseId');

    const [userData, setUserData] = useState<any>(null);
    const [courseData, setCourseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authUser && firestore && courseId) {
            const fetchReceiptData = async () => {
                setLoading(true);
                const docRef = doc(firestore, 'users', authUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const appliedCourse = data.appliedCourses?.find((c: any) => c.id === courseId);

                    if (appliedCourse && appliedCourse.paymentStatus === 'Paid') {
                        setUserData(data);
                        setCourseData(appliedCourse);
                    } else {
                        // Handle case where course not found or not paid
                        setUserData(null);
                        setCourseData(null);
                    }
                } else {
                    console.error("No such user document!");
                }
                setLoading(false);
            };
            fetchReceiptData();
        } else if (!authLoading) {
            setLoading(false); // No user, so stop loading
        }
    }, [authUser, authLoading, firestore, courseId]);
    
    const handlePrint = () => {
        window.print();
    };

    if (loading || authLoading) {
        return (
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className='ml-2'>Loading Payment Receipt...</p>
          </div>
        );
    }
    
    if (!userData || !courseData) {
        return (
          <div className="flex h-screen items-center justify-center">
            <p>Could not load payment receipt. Please ensure the course is paid for.</p>
            <Button variant="link" onClick={() => router.push('/candidate/apply')}>Go Back</Button>
          </div>
        );
    }

    const fullName = [userData.firstName, userData.middleName, userData.lastName].filter(Boolean).join(' ');
    const getFormattedDate = (date: any) => {
        if (!date) return '-';
        if (date instanceof Timestamp) return format(date.toDate(), 'PPP p');
        if (date instanceof Date) return format(date, 'PPP p');
        try {
          const parsedDate = new Date(date);
          if (!isNaN(parsedDate.getTime())) return format(parsedDate, 'PPP p');
        } catch { return 'Invalid Date'; }
        return String(date);
      };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 font-ui">
            <style>{`
              @media print {
                body * { visibility: hidden; }
                #printable-receipt, #printable-receipt * { visibility: visible; }
                #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; }
                .no-print { display: none; }
              }
            `}</style>
            <div className="flex justify-end gap-2 mb-4 no-print">
                <Button onClick={() => router.back()} variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Receipt</Button>
            </div>
            <Card id="printable-receipt" className="w-full max-w-3xl mx-auto">
                <CardHeader className="text-center space-y-4 border-b">
                    <NsscLogo className="h-20 w-20 mx-auto border border-black rounded-full" />
                    <CardTitle className="text-2xl font-bold">National Skills Sector Councils</CardTitle>
                    <CardDescription className="!mt-2 font-semibold text-lg">PAYMENT RECEIPT</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="border rounded-lg p-4">
                        <h3 className="font-bold text-primary mb-2">Student Details</h3>
                        <DetailItem label="Student Name" value={fullName} />
                        <DetailItem label="Profile ID" value={userData.profileId} />
                        <DetailItem label="Email" value={userData.email} />
                        <DetailItem label="Mobile Number" value={userData.primaryMobile} />
                    </div>
                     <div className="border rounded-lg p-4">
                        <h3 className="font-bold text-primary mb-2">Course & Payment Details</h3>
                        <DetailItem label="Course Name" value={courseData.courseCategory} />
                        <DetailItem label="Course Type" value={courseData.courseType} />
                        <DetailItem label="Application ID" value={courseData.applicationId} />
                        <DetailItem label="Amount Paid" value={`₹ ${courseData.amount}`} />
                        <DetailItem label="Payment ID" value={courseData.paymentId} />
                        <DetailItem label="Payment Date" value={getFormattedDate(courseData.lastUpdated)} />
                        <DetailItem label="Payment Status" value={courseData.paymentStatus} />
                    </div>
                    <p className="text-xs text-muted-foreground text-center pt-4">This is a computer-generated receipt and does not require a signature.</p>
                </CardContent>
            </Card>
        </div>
    );
}


export default function PaymentReceiptPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <PaymentReceiptContent />
        </Suspense>
    )
}
