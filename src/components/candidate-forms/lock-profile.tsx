
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import Image from 'next/image';
import { Timestamp } from 'firebase/firestore';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';


interface LockProfileProps {
  userData: any;
  onLock: () => void;
  onBack: () => void;
}

const DetailItem = ({ label, value }: { label: string; value: any }) => (
  <div className="flex flex-col sm:flex-row py-1">
    <p className="w-full sm:w-1/3 text-sm font-semibold text-gray-600">{label}</p>
    <p className="w-full sm:w-2/3 text-sm">{value || '-'}</p>
  </div>
);

export function LockProfile({ userData, onLock, onBack }: LockProfileProps) {
  const [isDeclared, setIsDeclared] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [signUrl, setSignUrl] = useState('');

  useEffect(() => {
    if (userData) {
      setPhotoUrl(userData.photoUrl || '');
      setSignUrl(userData.signUrl || '');
    }
  }, [userData]);


  const fullName = [
    userData.firstName,
    userData.middleName,
    userData.lastName,
  ]
    .filter(Boolean)
    .join(' ');
  
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
  ]
    .filter(Boolean)
    .join(', ');
  
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
    return String(date); // Fallback
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-bold text-primary">
              Review and Lock Profile
            </CardTitle>
          </div>
          <CardDescription>
            Profile ID: {userData.profileId}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Details */}
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
                        {photoUrl ? <Image src={photoUrl} alt="candidate" fill className="object-cover" /> : <span className="text-xs text-gray-400 flex items-center justify-center h-full">Photo</span>}
                    </div>
                     <div className="w-32 h-16 relative border-2 border-dashed rounded-md bg-gray-50 overflow-hidden">
                        {signUrl ? <Image src={signUrl} alt="signature" fill className="object-contain p-1" /> : <span className="text-xs text-gray-400 flex items-center justify-center h-full">Sign</span>}
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
                    <p className="text-sm text-center text-gray-500 py-2">No Work Experience</p>
                 )}
            </div>

            <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-bold text-primary">Declaration</h3>
                <div className="flex items-start space-x-3">
                    <Checkbox id="declaration" checked={isDeclared} onCheckedChange={(checked) => setIsDeclared(checked as boolean)} />
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="declaration" className="font-normal cursor-pointer">I hereby declare & understand that,</Label>
                        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                            <li>All the information furnished by me in this profile is true, complete and correct to the best of my knowledge and belief.</li>
                            <li>Entire information furnished by me in this profile is final and binding to me.</li>
                            <li>If any information furnished by me here, is found to be false or incorrect, I shall be liable for appropriate legal action and my application will be cancelled as per rules.</li>
                        </ol>
                    </div>
                </div>
            </div>

        </CardContent>
        <CardFooter className="flex justify-center gap-4 pt-8">
            <Button type="button" onClick={onBack} variant="outline">
                Back
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={!isDeclared}>Lock Profile Form</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive">
                    Are you sure you want to lock this profile?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Once locked, you will not be able to edit your profile details. Please review all details carefully before proceeding.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-red-500 text-white hover:bg-red-600">No</AlertDialogCancel>
                  <AlertDialogAction onClick={onLock} className="bg-green-500 hover:bg-green-600">Yes</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>
    </>
  );
}
