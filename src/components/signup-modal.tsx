
'use client';

import { useState } from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, UserPlus, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { PreviousRegistrationForm } from './previous-registration-form';
import { Card, CardContent, CardHeader } from './ui/card';

type Step =
  | 'category'
  | 'previousRegistrationCheck'
  | 'previousRegistration';

export function SignupModal() {
  const [step, setStep] = useState<Step>('category');
  const [category, setCategory] = useState('');
  const [hasPreviousRegistration, setHasPreviousRegistration] = useState<
    'Yes' | 'No' | ''
  >('');
  const router = useRouter();


  const handleCategorySubmit = () => {
    if (category === 'candidate') {
      setStep('previousRegistrationCheck');
    }
  };

  const handlePreviousRegistrationSubmit = () => {
    if (hasPreviousRegistration === 'No') {
      // Close the modal and redirect to the full registration page
      document.getElementById('signup-modal-close')?.click();
      router.push('/register');
    } else if (hasPreviousRegistration === 'Yes') {
      setStep('previousRegistration');
    }
  };
  
   const handleBack = () => {
    if (step === 'previousRegistrationCheck') {
      setStep('category');
    } else if (step === 'previousRegistration') {
      setStep('previousRegistrationCheck');
    }
  }


  const renderStepContent = () => {
    switch (step) {
      case 'category':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-select">Category *</Label>
              <Select onValueChange={setCategory} value={category}>
                <SelectTrigger id="category-select">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="candidate">Candidate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCategorySubmit}
              disabled={!category || category !== 'candidate'}
              className="w-full"
            >
              Proceed <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case 'previousRegistrationCheck':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>
                Have you registered for Paramedical Admission Previously?
              </Label>
              <RadioGroup
                onValueChange={(value: 'Yes' | 'No') =>
                  setHasPreviousRegistration(value)
                }
                value={hasPreviousRegistration}
                className="flex items-center gap-4 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="modal-prev-reg-yes" />
                  <Label htmlFor="modal-prev-reg-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="modal-prev-reg-no" />
                  <Label htmlFor="modal-prev-reg-no">No</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                className="w-full"
              >
                Back
              </Button>
              <Button
                onClick={handlePreviousRegistrationSubmit}
                disabled={!hasPreviousRegistration}
                className="w-full"
              >
                Submit
              </Button>
            </div>
          </div>
        );

      case 'previousRegistration':
        return (
           <>
              <PreviousRegistrationForm />
              <Button variant="link" className="mt-4 p-0" onClick={handleBack}>Back</Button>
           </>
        );
    }
  };


  return (
    <DialogContent className="sm:max-w-[525px] p-0 font-ui">
      <DialogHeader className="p-4 bg-primary text-primary-foreground flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <UserPlus />
          <DialogTitle>Candidate Registration</DialogTitle>
        </div>
        <DialogClose asChild>
          <Button
            id="signup-modal-close"
            variant="ghost"
            size="icon"
            className="hover:bg-primary/80"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogClose>
      </DialogHeader>
      <div className="p-6">
        {renderStepContent()}
      </div>
    </DialogContent>
  );
}
