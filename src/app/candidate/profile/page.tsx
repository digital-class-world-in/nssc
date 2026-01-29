
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, initializeFirebase } from '@/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { ref as dbRef, set as dbSet } from 'firebase/database';


import { cn } from '@/lib/utils';
import { PrimaryDetailsForm } from '@/components/candidate-forms/primary-details-form';
import { AddressDetailsForm } from '@/components/candidate-forms/address-details-form';
import { ParentDetailsForm } from '@/components/candidate-forms/parent-details-form';
import { CategoryDetailsForm } from '@/components/candidate-forms/category-details-form';
import { QualificationDetailsForm } from '@/components/candidate-forms/qualification-details-form';
import { TrainingDetailsForm } from '@/components/candidate-forms/training-details-form';
import { AdditionalDetailsForm } from '@/components/candidate-forms/additional-details-form';
import { BankDetailsForm } from '@/components/candidate-forms/bank-details-form';
import { WorkExperienceForm } from '@/components/candidate-forms/work-experience-form';
import { LockProfile } from '@/components/candidate-forms/lock-profile';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const steps = [
  'Primary',
  'Address',
  'Parent',
  'Category',
  'Qualification',
  'Training',
  'Additional',
  'Bank',
  'Work Experience',
  'Lock',
];

const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <div className="flex items-center justify-center mb-8 overflow-x-auto pb-4">
    <div className="flex items-center">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0',
                index + 1 === currentStep
                  ? 'bg-primary text-white border-primary'
                  : 'bg-gray-200 border-gray-300',
                index + 1 < currentStep ? 'bg-green-500 border-green-600 text-white' : ''
              )}
            >
              {index + 1}
            </div>
            <p className="text-xs mt-1 text-center max-w-[60px]">{step}</p>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'flex-auto border-t-2  w-8 sm:w-12',
                index + 1 < currentStep ? 'border-green-500' : 'border-gray-300'
              )}
            ></div>
          )}
        </div>
      ))}
    </div>
  </div>
);

function CandidateProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useUser();
  const { firestore, database } = initializeFirebase();
  const [userData, setUserData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    const step = searchParams.get('step');
    if (step && !isNaN(parseInt(step))) {
      setCurrentStep(parseInt(step));
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && firestore) {
      const fetchUserData = async () => {
        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Ensure nested fields are initialized
          if (!data.qualifications) data.qualifications = [];
          if (!data.languages) data.languages = [];
          
          // Convert Firestore Timestamps to JS Date objects
          if (data.dob && data.dob instanceof Timestamp) {
            data.dob = data.dob.toDate();
          }

          setUserData(data);
        } else {
            // Initialize with default structure if document doesn't exist
            setUserData({
                email: user.email,
                qualifications: [],
                languages: [],
                profileLocked: false,
            });
        }
      };

      fetchUserData();
    }
  }, [user, firestore, router]);

  const handleNextStep = async (data: any) => {
    if (user) {
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        // Special handling for date objects to convert them to Timestamps
        const dataToSave = { ...data };
        if (dataToSave.dob && dataToSave.dob instanceof Date) {
            dataToSave.dob = Timestamp.fromDate(dataToSave.dob);
        }
        
        const profileCompletionPercentage = (currentStep / (steps.length-1)) * 100;

        const updatedData = { ...userData, ...dataToSave, profileCompletion: profileCompletionPercentage };
        await setDoc(userDocRef, updatedData, { merge: true });
        setUserData(updatedData);
        if (currentStep < steps.length) {
            setCurrentStep((prev) => prev + 1);
            router.push(`/candidate/profile?step=${currentStep + 1}`, { scroll: false });
        }
        toast({
          title: 'Success',
          description: `Step ${currentStep} saved.`,
        });
      } catch (error: any) {
        console.error("Error saving data:", error);
        toast({
            variant: "destructive",
            title: 'Error',
            description: `Failed to save data: ${error.message}`,
        });
      }
    }
  };

  const handleProfileLock = async () => {
    if (user && database && firestore) {
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        
        const updatedData = {
          ...userData,
          profileLocked: true,
          profileCompletion: 100,
        };

        const dbData = JSON.parse(JSON.stringify(updatedData, (key, value) => {
            if (value instanceof Timestamp) {
                return value.toDate().toISOString();
            }
             if (value instanceof Date) {
                return value.toISOString();
            }
            return value;
        }));

        const userDbRef = dbRef(database, `users/${user.uid}`);
        await dbSet(userDbRef, dbData);

        await setDoc(userDocRef, { profileLocked: true, profileCompletion: 100, photoUrl: userData.photoUrl, signUrl: userData.signUrl }, { merge: true });

        setUserData(updatedData);
        toast({
          title: 'Profile Locked & Saved!',
          description:
            'Your profile has been successfully saved to the database and locked. Redirecting to dashboard...',
        });
        router.push('/candidate/dashboard');
      } catch (error: any) {
        console.error('Error locking profile:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `Failed to lock profile: ${error.message}`,
        });
      }
    }
  };

  const handleUnlockProfile = async () => {
    if (user && firestore) {
        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            await setDoc(userDocRef, { profileLocked: false }, { merge: true });
            setUserData((prev: any) => ({ ...prev, profileLocked: false }));
            toast({
                title: 'Profile Unlocked',
                description: 'You can now edit your profile details.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Unlock Failed',
                description: `Could not unlock profile: ${error.message}`,
            });
        }
    }
  };


  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      router.push(`/candidate/profile?step=${currentStep - 1}`, { scroll: false });
    }
  }

  if (loading || !user || !userData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <div className="text-xl font-semibold ml-4">Loading profile...</div>
      </div>
    );
  }

  const isLocked = userData.profileLocked;

  const renderStep = () => {
    if (isLocked) {
        return (
            <Card className="text-center">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2 text-destructive">
                        <Lock />
                        Profile Locked
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Your profile is locked and cannot be edited.</p>
                    <p className="text-sm text-muted-foreground">To make changes, you must first unlock your profile.</p>
                    <Button onClick={handleUnlockProfile} className="mt-4">
                        <Unlock className="mr-2 h-4 w-4" />
                        Unlock Profile
                    </Button>
                </CardContent>
            </Card>
        )
    }

    switch (currentStep) {
        case 1:
            return <PrimaryDetailsForm userData={userData} onNext={handleNextStep} isLocked={isLocked} />;
        case 2:
            return <AddressDetailsForm userData={userData} onNext={handleNextStep} onBack={handlePreviousStep} isLocked={isLocked} />;
        case 3:
            return <ParentDetailsForm userData={userData} onNext={handleNextStep} onBack={handlePreviousStep} isLocked={isLocked} />;
        case 4:
            return <CategoryDetailsForm userData={userData} onNext={handleNextStep} onBack={handlePreviousStep} isLocked={isLocked} />;
        case 5:
            return <QualificationDetailsForm userData={userData} onNext={handleNextStep} onBack={handlePreviousStep} isLocked={isLocked} />;
        case 6:
            return <TrainingDetailsForm userData={userData} onNext={handleNextStep} onBack={handlePreviousStep} isLocked={isLocked} />;
        case 7:
            return <AdditionalDetailsForm userData={userData} onNext={handleNextStep} onBack={handlePreviousStep} isLocked={isLocked} />;
        case 8:
            return <BankDetailsForm userData={userData} onNext={handleNextStep} onBack={handlePreviousStep} isLocked={isLocked} />;
        case 9:
            return <WorkExperienceForm userData={userData} onNext={handleNextStep} onBack={handlePreviousStep} isLocked={isLocked} />;
        case 10:
            return <LockProfile userData={userData} onLock={handleProfileLock} onBack={handlePreviousStep} />;
        default:
            return <PrimaryDetailsForm userData={userData} onNext={handleNextStep} isLocked={isLocked} />;
    }
  }


  return (
    <div className="container mx-auto p-4 font-ui">
      {!isLocked && <StepIndicator currentStep={currentStep} />}
      {renderStep()}
    </div>
  );
}

export default function CandidateProfilePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /><div className="text-xl font-semibold ml-4">Loading...</div></div>}>
            <CandidateProfileContent />
        </Suspense>
    )
}
