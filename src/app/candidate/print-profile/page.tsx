
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, initializeFirebase } from '@/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { format } from 'date-fns';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Printer, Loader2 } from 'lucide-react';

const DetailItem = ({ label, value }: { label: string; value: any }) => (
  <div className="flex flex-col sm:flex-row py-1">
    <p className="w-full sm:w-1/3 text-sm font-semibold text-gray-600">{label}</p>
    <p className="w-full sm:w-2/3 text-sm">{value || '-'}</p>
  </div>
);

function PrintProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: authUser, loading: authLoading } = useUser();
  const { firestore } = initializeFirebase();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentIdFromParams = searchParams.get('studentId');
    const targetUserId = studentIdFromParams || authUser?.uid;

    if (!targetUserId) {
        if (!authLoading) {
            router.push('/');
        }
        return;
    }
    
    // Allow admins to view any profile, otherwise, users can only view their own.
    // A proper admin check should be implemented here in a real app.
    if (studentIdFromParams && !authUser) { // A simple check, can be improved
      // For now, we assume if studentId is passed, an admin is viewing.
      // In a real app, you'd have an admin role check.
    } else if (!studentIdFromParams && !authUser) {
      router.push('/');
      return;
    }


    const fetchUserData = async () => {
        setLoading(true);
        const docRef = doc(firestore, 'users', targetUserId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.error("No such document!");
        }
        setLoading(false);
    };

    if (firestore) {
        fetchUserData();
    }
  }, [authUser, authLoading, firestore, router, searchParams]);

  const handlePrint = () => {
    window.print();
  };
  
  const handleBack = () => {
      router.back(); // Go back to the previous page, likely admin dashboard
  }

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className='ml-2'>Loading Profile for Printing...</p>
      </div>
    );
  }

  if (!userData) {
      return (
          <div className="flex h-screen items-center justify-center">
              <p>Could not load user profile.</p>
          </div>
      )
  }
  
  const fullName = [
    userData.firstName,
    userData.middleName,
    userData.lastName,
  ].filter(Boolean).join(' ');

  const fatherName = [
      userData.fatherFirstName,
      userData.fatherMiddleName,
      userData.fatherLastName,
  ].filter(Boolean).join(' ');

  const motherName = [
        userData.motherFirstName,
        userData.motherMiddleName,
        userData.motherLastName,
    ].filter(Boolean).join(' ');

  const correspondenceAddress = [
    userData.correspondenceAddress,
    userData.correspondenceCity,
    userData.correspondenceTaluka,
    userData.correspondenceDistrict,
    userData.correspondenceState,
    userData.correspondencePincode,
  ].filter(Boolean).join(', ');
  
  const permanentAddress = userData.isSameAddress 
    ? 'Same as Correspondence Address' 
    : [
        userData.permanentAddress,
        userData.permanentCity,
        userData.permanentTaluka,
        userData.permanentDistrict,
        userData.permanentState,
        userData.permanentPincode,
      ].filter(Boolean).join(', ');

  const getFormattedDate = (date: any) => {
    if (!date) return '-';
    if (date instanceof Timestamp) {
      return format(date.toDate(), 'dd/MM/yyyy');
    }
     if (date instanceof Date) {
      return format(date, 'dd/MM/yyyy');
    }
    try {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
          return format(parsedDate, 'dd/MM/yyyy');
      }
    } catch {
       return 'Invalid Date';
    }
    return String(date);
  };
  

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 font-ui">
       <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-profile, #printable-profile * {
              visibility: visible;
            }
            #printable-profile {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
                display: none;
            }
          }
        `}</style>

       <div className="flex justify-end gap-2 mb-4 no-print">
            <Button onClick={handleBack} variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</Button>
        </div>
      <Card id="printable-profile">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-primary">
            Candidate Profile
          </CardTitle>
          <CardDescription>
            NSSC Registration No: {userData.profileId}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-bold text-primary mb-2">Primary Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className='md:col-span-2 space-y-1'>
                    <DetailItem label="Candidate's Name" value={fullName} />
                    <DetailItem label="Gender" value={userData.gender} />
                    <DetailItem label="Date Of Birth" value={getFormattedDate(userData.dob)} />
                    <DetailItem label="Aadhaar Number" value={`********${userData.aadhaarNumber?.slice(-4)}`} />
                    <DetailItem label="Primary Mobile Number" value={userData.primaryMobile} />
                    <DetailItem label="Secondary Mobile Number" value={userData.secondaryMobile} />
                    <DetailItem label="E-Mail ID" value={userData.email} />
                </div>
                <div className='flex flex-col items-center justify-center gap-4'>
                    <div className="w-32 h-40 relative border-2 border-dashed rounded-md bg-gray-50 overflow-hidden">
                        {userData.photoUrl ? <Image src={userData.photoUrl} alt="candidate" fill className="object-cover" /> : <span className="text-xs text-gray-400 flex items-center justify-center h-full">Photo</span>}
                    </div>
                     <div className="w-32 h-16 relative border-2 border-dashed rounded-md bg-gray-50 overflow-hidden">
                        {userData.signUrl ? <Image src={userData.signUrl} alt="signature" fill className="object-contain p-1" /> : <span className="text-xs text-gray-400 flex items-center justify-center h-full">Sign</span>}
                    </div>
                </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-bold text-primary mb-2">Address Details</h3>
            <DetailItem label="Correspondence Address" value={correspondenceAddress} />
             <DetailItem label="Permanent Address" value={permanentAddress} />
          </div>

          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-bold text-primary mb-2">Parent / Guardian Details</h3>
            <DetailItem label="Orphan Candidate" value={userData.orphan} />
            <DetailItem label="Father's Name" value={fatherName} />
            <DetailItem label="Mother's Name" value={motherName} />
            <DetailItem label="Marital Status" value={userData.maritalStatus} />
          </div>

          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-bold text-primary mb-2">Category Details</h3>
            <DetailItem label="Nationality" value={userData.nationality} />
            <DetailItem label="Maharashtra Domiciled" value={userData.maharashtraDomiciled} />
            <DetailItem label="Religion" value={userData.religion} />
            <DetailItem label="Caste Category" value={userData.casteCategory} />
            <DetailItem label="Person with Disability" value={userData.isPersonWithDisability} />
            {userData.isPersonWithDisability === 'Yes' && <DetailItem label="Disability Type" value={userData.disabilityType} />}
          </div>

            <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-bold text-primary mb-2">Qualification Details</h3>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Examination</TableHead>
                            <TableHead>Board/University</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Class/Grade</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {userData.qualifications?.length > 0 ? userData.qualifications.map((q: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{q.examination}</TableCell>
                                <TableCell>{q.boardUniversity}</TableCell>
                                <TableCell>{q.percentage}%</TableCell>
                                <TableCell>{q.classGrade}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={4} className="text-center">No qualifications added.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-bold text-primary mb-2">Training Details</h3>
                <DetailItem label="Completed Training" value={userData.completedTraining} />
            </div>

            <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-bold text-primary mb-2">Additional Details</h3>
                <DetailItem label="Blood Group" value={userData.bloodGroup} />
                <DetailItem label="Mother Tongue" value={userData.motherTongue} />
                <h4 className="font-semibold text-sm pt-2">Languages Known</h4>
                {userData.languages?.length > 0 ? userData.languages.map((l: any, index: number) => (
                    <div key={index} className="pl-4 text-sm">{l.name} (Read: {l.read ? 'Yes' : 'No'}, Write: {l.write ? 'Yes' : 'No'}, Speak: {l.speak ? 'Yes' : 'No'})</div>
                )) : <p className="pl-4 text-sm">No languages added.</p>}
            </div>

             <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-bold text-primary mb-2">Bank Details</h3>
                {userData.hasBankAccount === 'Yes' ? (
                    <>
                        <DetailItem label="Account Type" value={userData.accountType} />
                        <DetailItem label="Account Number" value={userData.accountNumber} />
                        <DetailItem label="Account Holder Name" value={userData.accountHolderName} />
                        <DetailItem label="Bank Name" value={userData.bankName} />
                        <DetailItem label="Branch Name" value={userData.branchName} />
                        <DetailItem label="IFSC Code" value={userData.ifscCode} />
                    </>
                ) : (
                    <DetailItem label="PAN Number" value={userData.panNumber} />
                )}
            </div>

            <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-bold text-primary mb-2">Work Experience</h3>
                <DetailItem label="Has Work Experience" value={userData.hasWorkExperience} />
                 {userData.hasWorkExperience === 'Yes' && userData.experiences?.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Organization</TableHead>
                                <TableHead>Designation</TableHead>
                                <TableHead>From</TableHead>
                                <TableHead>To</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userData.experiences.map((exp: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell>{exp.organization}</TableCell>
                                    <TableCell>{exp.designation}</TableCell>
                                    <TableCell>{getFormattedDate(exp.from)}</TableCell>
                                    <TableCell>{getFormattedDate(exp.to)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 ) : (
                    userData.hasWorkExperience === 'No' && <p className="text-sm text-center text-gray-500 py-2">No Work Experience</p>
                 )}
            </div>
             <div className="pt-8 text-right">
                <div className="w-48 ml-auto">
                    {userData.signUrl && <Image src={userData.signUrl} alt="signature" width={150} height={75} className="object-contain" />}
                    <div className="border-t border-gray-400 mt-2 pt-1 text-sm text-center font-semibold">
                        Signature
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function PrintProfilePage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <PrintProfileContent />
        </Suspense>
    )
}
