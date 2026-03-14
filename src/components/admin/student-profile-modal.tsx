
'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { Loader2, X, Printer } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useRouter } from 'next/navigation';

interface StudentProfileModalProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
}

const DetailItem = ({ label, value }: { label: string; value: any }) => (
    <div className="grid grid-cols-3 gap-2 py-1.5 border-b">
      <p className="text-sm font-semibold text-gray-600 col-span-1">{label}</p>
      <p className="text-sm col-span-2">{value || '-'}</p>
    </div>
  );

export function StudentProfileModal({ studentId, isOpen, onClose }: StudentProfileModalProps) {
  const { firestore } = initializeFirebase();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isOpen && studentId && firestore) {
        setLoading(true);
        const docRef = doc(firestore, 'users', studentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.error('No such student document!');
          setUserData(null);
        }
        setLoading(false);
      }
    };
    fetchUserData();
  }, [isOpen, studentId, firestore]);

  const handlePrint = () => {
    if (studentId) {
      window.open(`/candidate/print-profile?studentId=${studentId}`, '_blank');
    }
  }

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
       // ignore
    }
    return String(date);
  };

  const fullName = userData ? [userData.firstName, userData.middleName, userData.lastName].filter(Boolean).join(' ') : '';
  const fatherName = userData ? [userData.fatherFirstName, userData.fatherMiddleName, userData.fatherLastName].filter(Boolean).join(' ') : '';
  const motherName = userData ? [userData.motherFirstName, userData.motherMiddleName, userData.motherLastName].filter(Boolean).join(' ') : '';
  const correspondenceAddress = userData ? [userData.correspondenceAddress, userData.correspondenceCity, userData.correspondenceTaluka, userData.correspondenceDistrict, userData.correspondenceState, userData.correspondencePincode].filter(Boolean).join(', ') : '';
  const permanentAddress = userData?.isSameAddress ? 'Same as Correspondence Address' : (userData ? [userData.permanentAddress, userData.permanentCity, userData.permanentTaluka, userData.permanentDistrict, userData.permanentState, userData.permanentPincode].filter(Boolean).join(', ') : '');

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!userData) {
      return <div className="text-center p-8">Failed to load student data or student not found.</div>;
    }

    return (
        <div id="profile-modal-content" className="space-y-6">
        <div className="border rounded-lg p-4 space-y-2 bg-gray-50/50">
            <h3 className="font-bold text-primary mb-2 text-md">Primary Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className='md:col-span-2 space-y-1'>
                    <DetailItem label="NSSC Registration No." value={userData.profileId} />
                    <DetailItem label="Candidate's Name" value={fullName} />
                    <DetailItem label="Gender" value={userData.gender} />
                    <DetailItem label="Date Of Birth" value={getFormattedDate(userData.dob)} />
                    <DetailItem label="Aadhaar Number" value={`********${userData.aadhaarNumber?.slice(-4)}`} />
                    <DetailItem label="Primary Mobile" value={userData.primaryMobile} />
                    <DetailItem label="Secondary Mobile" value={userData.secondaryMobile} />
                    <DetailItem label="E-Mail ID" value={userData.email} />
                </div>
                <div className='flex flex-col items-center justify-start gap-4'>
                    <div className="w-24 h-32 relative border-2 border-dashed rounded-md bg-gray-100">
                        {userData.photoUrl ? <Image src={userData.photoUrl} alt="candidate" fill className="object-cover rounded-md" /> : <span className="text-xs text-gray-400 flex items-center justify-center h-full">Photo</span>}
                    </div>
                     <div className="w-24 h-12 relative border-2 border-dashed rounded-md bg-gray-100">
                        {userData.signUrl ? <Image src={userData.signUrl} alt="signature" fill className="object-contain p-1" /> : <span className="text-xs text-gray-400 flex items-center justify-center h-full">Sign</span>}
                    </div>
                </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-2 bg-gray-50/50">
            <h3 className="font-bold text-primary mb-2 text-md">Address Details</h3>
            <DetailItem label="Correspondence Address" value={correspondenceAddress} />
             <DetailItem label="Permanent Address" value={permanentAddress} />
          </div>

          <div className="border rounded-lg p-4 space-y-2 bg-gray-50/50">
            <h3 className="font-bold text-primary mb-2 text-md">Parent / Guardian Details</h3>
            <DetailItem label="Orphan Candidate" value={userData.orphan} />
            <DetailItem label="Father's Name" value={fatherName} />
            <DetailItem label="Mother's Name" value={motherName} />
            <DetailItem label="Marital Status" value={userData.maritalStatus} />
          </div>

          <div className="border rounded-lg p-4 space-y-2 bg-gray-50/50">
            <h3 className="font-bold text-primary mb-2 text-md">Category Details</h3>
            <DetailItem label="Nationality" value={userData.nationality} />
            <DetailItem label="Maharashtra Domiciled" value={userData.maharashtraDomiciled} />
            <DetailItem label="Religion" value={userData.religion} />
            <DetailItem label="Caste Category" value={userData.casteCategory} />
            <DetailItem label="Person with Disability" value={userData.isPersonWithDisability} />
          </div>

            <div className="border rounded-lg p-4 space-y-2 bg-gray-50/50">
                <h3 className="font-bold text-primary mb-2 text-md">Qualification Details</h3>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-xs">Exam</TableHead>
                            <TableHead className="text-xs">Board/University</TableHead>
                            <TableHead className="text-xs">Percentage</TableHead>
                            <TableHead className="text-xs">Grade</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {userData.qualifications?.length > 0 ? userData.qualifications.map((q: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell className="text-xs">{q.examination}</TableCell>
                                <TableCell className="text-xs">{q.boardUniversity}</TableCell>
                                <TableCell className="text-xs">{q.percentage}%</TableCell>
                                <TableCell className="text-xs">{q.classGrade}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={4} className="text-center text-xs">No qualifications added.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="border rounded-lg p-4 space-y-2 bg-gray-50/50">
                <h3 className="font-bold text-primary mb-2">Additional Details</h3>
                <DetailItem label="Blood Group" value={userData.bloodGroup} />
                <DetailItem label="Mother Tongue" value={userData.motherTongue} />
                <h4 className="font-semibold text-sm pt-2">Languages Known</h4>
                {userData.languages?.length > 0 ? userData.languages.map((l: any, index: number) => (
                    <div key={index} className="pl-4 text-sm">{l.name} (Read: {l.read ? 'Yes' : 'No'}, Write: {l.write ? 'Yes' : 'No'}, Speak: {l.speak ? 'Yes' : 'No'})</div>
                )) : <p className="pl-4 text-sm">No languages added.</p>}
            </div>

             <div className="border rounded-lg p-4 space-y-2 bg-gray-50/50">
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
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0">
         <style>{`
          @media print {
            body > *:not(#profile-modal-content) {
              visibility: hidden;
            }
            #profile-modal-content, 
            #profile-modal-content * {
              visibility: visible;
            }
             #profile-modal-content {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 20px;
                margin: 0;
                border: none;
                border-radius: 0;
             }
             .no-print {
                display: none !important;
            }
          }
        `}</style>
        <DialogHeader className="p-4 bg-slate-100 flex flex-row items-center justify-between no-print">
          <DialogTitle>Student Profile</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto p-6">
            {renderContent()}
        </div>
        <DialogFooter className="p-4 border-t no-print">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
           <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Print Profile</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
