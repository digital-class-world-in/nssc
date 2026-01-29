

'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUser, initializeFirebase } from '@/firebase';
import { doc, setDoc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AppliedCourse {
  id: string;
  applicationId: string;
  courseType: string;
  courseCategory: string; // Course Name
  courseYear: string; // 1st Year or 2nd Year
  lastUpdated: string;
  amount: string;
  date: string;
  status: 'Pending' | 'Appointment Booked' | 'Verified' | 'Rejected' | 'Refill Required';
  paymentStatus: 'Pending' | 'Paid';
  appointmentDate?: string;
}

const courseTypes = [
    { value: 'health-care-course', label: 'Health Care Course' },
    { value: 'advanced-diploma', label: 'Advance Diploma' },
    { value: 'certificate-course', label: 'Certificate Course' },
];

const courses = [
    { value: 'adcdt', label: 'ADVANCE DIPLOMA COURSE IN DIALYSIS TECHNOLOGY (MSBQ165001)', type: 'advanced-diploma', amount: '1.00' },
    { value: 'adcnh', label: 'ADVANCE DIPLOMA COURSE IN NATURAL HEALING', type: 'advanced-diploma', amount: '1.00' },
    { value: 'ccamt', label: 'CERTIFICATE COURSE IN ACUPRESSURE AND MASSAGE THERAPY (MSBQ201221)', type: 'certificate-course', amount: '1.00' },
    { value: 'ccaht', label: 'CERTIFICATE COURSE IN ALTERNATE HEALING THERAPY', type: 'certificate-course', amount: '1.00' },
    { value: 'ccda', label: 'CERTIFICATE COURSE IN DENTAL ASSISTANT', type: 'certificate-course', amount: '1.00' },
    { value: 'ccdt', label: 'CERTIFICATE COURSE IN DIALYSIS TECHNICIAN (MSBQ201231)', type: 'certificate-course', amount: '1.00' },
    { value: 'cceh', label: 'CERTIFICATE COURSE IN ELECTRO HOMOEOPATHIC (MSBQ201234)', type: 'certificate-course', amount: '1.00' },
    { value: 'ccgnma', label: 'CERTIFICATE COURSE IN GENERAL NURSING AND MIDWIFERY ASSISTANT (MSBQ201237)', type: 'certificate-course', amount: '1.00' },
    { value: 'cchsi', label: 'CERTIFICATE COURSE IN HEALTH SANITARY INSPECTOR (MSBQ201238)', type: 'certificate-course', amount: '1.00' },
    { value: 'cchw', label: 'CERTIFICATE COURSE IN HEALTH WORKER (MSBQ201203)', type: 'certificate-course', amount: '1.00' },
    { value: 'ccnt', label: 'CERTIFICATE COURSE IN NEUROTHERAPY (MSBQ201235)', type: 'certificate-course', amount: '1.00' },
    { value: 'ccnc', label: 'CERTIFICATE COURSE IN NURSING CARE (MSBQ201226)', type: 'certificate-course', amount: '1.00' },
    { value: 'ccpcs', label: 'CERTIFICATE COURSE IN PANCHGAVYA CHIKITSA AND SENDRIYA SHETI (MSBQ201232)', type: 'certificate-course', amount: '1.00' },
    { value: 'ccot', label: 'CERTIFICATE COURSE IN OPHTHALMIC TECHNICIAN (MSBQ201228)', type: 'certificate-course', amount: '1.00' },
    { value: 'ccott', label: 'CERTIFICATE COURSE IN OPERATION THEATRE TECHNICIAN (MSBQ201201)', type: 'certificate-course', amount: '1.00' },
    { value: 'ccpot', label: 'CERTIFICATE COURSE IN PROSTHETIC AND ORTHOTIC TECHNICIAN (MSBQ201236)', type: 'certificate-course', amount: '1.00' },
    { value: 'ccrt', label: 'CERTIFICATE COURSE IN RADIOLOGY TECHNICIAN (MSBQ201229)', type: 'certificate-course', amount: '1.00' },
    { value: 'ccvt', label: 'CERTIFICATE COURSE IN VETERINARY TECHNICIAN (MSBQ201216)', type: 'certificate-course', amount: '1.00' },
    { value: 'ccynt', label: 'CERTIFICATE COURSE IN YOGA AND NATUROTHERAPHY (MSBQ201208)', type: 'certificate-course', amount: '1.00' },
    { value: 'ccyt', label: 'CERTIFICATE COURSE IN YOGA TEACHER (MSBQ201224)', type: 'certificate-course', amount: '1.00' },
];


function ApplyForRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useUser();
  const { firestore } = initializeFirebase();
  const { toast } = useToast();

  const [appliedCourses, setAppliedCourses] = useState<AppliedCourse[]>([]);
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseYear, setCourseYear] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      const courseId = searchParams.get('courseId');
      if (courseId) {
        toast({
          title: 'Payment Successful!',
          description: 'Your application is updated. You can now book your appointment and download the payment receipt.',
        });
        // The onSnapshot listener will handle the UI update
      }
    }
  }, [searchParams, toast]);
  
  useEffect(() => {
    if (user && firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().appliedCourses) {
                setAppliedCourses(docSnap.data().appliedCourses);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    } else if (!userLoading) {
        setLoading(false);
    }
  }, [user, firestore, userLoading]);
  
  const updateCoursesInFirestore = async (courses: AppliedCourse[]) => {
      if (!user || !firestore) return;
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, { appliedCourses: courses }, { merge: true });
        // No need to setAppliedCourses here, onSnapshot will do it.
      } catch (error) {
          console.error("Failed to update courses in Firestore:", error);
          toast({
              variant: 'destructive',
              title: 'Database Error',
              description: 'Could not save changes to the database.'
          })
      }
  }

  const handleApplyCourse = async () => {
    if (!selectedCourseType || !selectedCourse || !courseYear) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a course type, course, and year.',
      });
      return;
    }
   
    const selectedCourseData = courses.find(c => c.value === selectedCourse);
    if (!selectedCourseData) {
        toast({ variant: 'destructive', title: 'Error', description: 'Selected course not found.' });
        return;
    }

    const newCourse: AppliedCourse = {
      id: `app-${Date.now()}`,
      applicationId: `202509C329110/CC/${new Date().getFullYear()}/${(
        appliedCourses.length + 1
      )
        .toString()
        .padStart(2, '0')}`,
      courseType: courseTypes.find(ct => ct.value === selectedCourseType)?.label || 'Unknown Type',
      courseCategory: selectedCourseData.label,
      courseYear: courseYear,
      lastUpdated: new Date().toISOString(),
      amount: selectedCourseData.amount,
      date: new Date().toISOString(),
      status: 'Pending',
      paymentStatus: 'Pending',
    };

    const updatedCourses = [...appliedCourses, newCourse];
    await updateCoursesInFirestore(updatedCourses);

    toast({
        title: 'Application Added',
        description: 'Your new course application has been successfully added.',
    });
  };
  
  const handleOpenAppointmentPage = (courseId: string) => {
    router.push(`/candidate/appointment?applicationId=${courseId}`);
  };
  
  const getStatusVariant = (status: AppliedCourse['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Verified':
      case 'Appointment Booked':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Rejected':
      case 'Refill Required':
        return 'destructive';
      default:
        return 'outline';
    }
  };


  if (loading || userLoading) {
      return (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  const filteredCourses =
    selectedCourseType === 'health-care-course'
      ? courses
      : courses.filter((c) => c.type === selectedCourseType);

  return (
    <>
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 font-ui space-y-8">
      <Card>
        <CardHeader className="bg-gray-600 text-white rounded-t-lg p-3">
          <CardTitle className="text-lg">Application for Registration</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
             <div className="space-y-2">
              <Label htmlFor="course-type-select">Course Type</Label>
              <Select onValueChange={setSelectedCourseType} value={selectedCourseType}>
                <SelectTrigger id="course-type-select">
                  <SelectValue placeholder="Select Course Type" />
                </SelectTrigger>
                <SelectContent>
                  {courseTypes.map((courseType) => (
                    <SelectItem key={courseType.value} value={courseType.value}>
                      {courseType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-select">Course</Label>
              <Select onValueChange={setSelectedCourse} value={selectedCourse} disabled={!selectedCourseType}>
                <SelectTrigger id="course-select">
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCourses.map((course) => (
                    <SelectItem key={course.value} value={course.value}>
                      {course.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-year">Course Year</Label>
              <Select onValueChange={setCourseYear} value={courseYear}>
                <SelectTrigger id="course-year">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1st Year">1st Year</SelectItem>
                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                    <SelectItem value="4th Year">4th Year</SelectItem>
                    <SelectItem value="5th Year">5th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-start pt-4">
            <Button
              onClick={handleApplyCourse}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Add New Application
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-gray-600 text-white rounded-t-lg p-3">
          <CardTitle className="text-lg">Your Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {appliedCourses.length === 0 ? (
            <p className="text-center text-gray-500">No applications found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sr. No.</TableHead>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appliedCourses.map((course, index) => {
                    const isAppointmentDisabled = course.paymentStatus !== 'Paid' || course.status === 'Verified' || course.status === 'Rejected';
                    const appointmentButtonText = () => {
                        if (course.status === 'Appointment Booked') return `Booked: ${new Date(course.appointmentDate!).toLocaleDateString()}`;
                        if (course.status === 'Refill Required') return 'Re-book Appointment';
                        return 'Book Appointment';
                    }

                    return (
                        <TableRow key={course.id}>
                        <TableCell>{index + 1}.</TableCell>
                        <TableCell>{course.applicationId}</TableCell>
                        <TableCell>{course.courseCategory}</TableCell>
                        <TableCell>{course.courseYear}</TableCell>
                        <TableCell>₹{course.amount}</TableCell>
                        <TableCell>{new Date(course.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <Button 
                                variant={course.paymentStatus === 'Paid' ? 'default' : 'outline'}
                                className={cn(course.paymentStatus === 'Paid' && 'bg-green-600 hover:bg-green-700')}
                                size="sm"
                                onClick={() => handleOpenAppointmentPage(course.id)}
                                disabled={isAppointmentDisabled}
                            >
                              {appointmentButtonText()}
                            </Button>
                        </TableCell>
                        <TableCell>
                            {course.paymentStatus === 'Paid' ? (
                                <Link href={`/candidate/payment-receipt?courseId=${course.id}`}>
                                    <Button variant="outline" size="sm">
                                        Payment Receipt
                                    </Button>
                                </Link>
                            ) : (
                                <Link href={`/candidate/payment-confirmation?courseId=${course.id}`}>
                                <Button variant="destructive" size="sm">
                                    Pay Fees
                                </Button>
                                </Link>
                            )}
                        </TableCell>
                        <TableCell>
                           <Badge variant={getStatusVariant(course.status)}>
                                {course.status}
                            </Badge>
                        </TableCell>
                        </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}

export default function ApplyForRegistrationPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <ApplyForRegistrationContent />
        </Suspense>
    )
}
