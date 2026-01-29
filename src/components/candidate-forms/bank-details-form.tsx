
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { StepButtons } from './step-buttons';
import { Upload } from 'lucide-react';
import { FileUploadModal } from '../file-upload-modal';
import { FileViewModal } from '../file-view-modal';
import { useUser, initializeFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

const bankDetailsSchema = z.object({
  hasBankAccount: z.enum(['Yes', 'No']),
  accountType: z.string().optional(),
  accountNumber: z.string().optional(),
  accountHolderName: z.string().optional(),
  ifscCode: z.string().optional(),
  bankName: z.string().optional(),
  branchName: z.string().optional(),
  panNumber: z.string().optional(),
  passbookFileUrl: z.string().optional(),
  panFileUrl: z.string().optional(),
}).refine(data => {
    if (data.hasBankAccount === 'Yes') {
        return !!data.accountType && !!data.accountNumber && !!data.accountHolderName && !!data.ifscCode && !!data.bankName && !!data.branchName;
    }
    if (data.hasBankAccount === 'No') {
        return !!data.panNumber;
    }
    return true;
}, {
    message: 'Please fill all required fields.',
    path: ['hasBankAccount'], // This is a general error, so we attach it to the root radio button
});


type BankDetailsFormValues = z.infer<typeof bankDetailsSchema>;

interface BankDetailsFormProps {
  userData: any;
  onNext: (data: BankDetailsFormValues) => void;
  onBack: () => void;
  isLocked: boolean;
}

type FileInfo = { name: string; url: string } | null;

export function BankDetailsForm({
  userData,
  onNext,
  onBack,
  isLocked
}: BankDetailsFormProps) {
  const { user } = useUser();
  const { firestore } = initializeFirebase();
  const [isPassbookUploadOpen, setIsPassbookUploadOpen] = useState(false);
  const [isPanUploadOpen, setIsPanUploadOpen] = useState(false);
  
  const [passbookFile, setPassbookFile] = useState<FileInfo>(null);
  const [panFile, setPanFile] = useState<FileInfo>(null);
  
  const [viewingFile, setViewingFile] = useState<FileInfo & { title: string } | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BankDetailsFormValues>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      hasBankAccount: userData.hasBankAccount || 'Yes',
      accountType: userData.accountType || '',
      accountNumber: userData.accountNumber || '',
      accountHolderName: userData.accountHolderName || '',
      ifscCode: userData.ifscCode || '',
      bankName: userData.bankName || '',
      branchName: userData.branchName || '',
      panNumber: userData.panNumber || '',
      passbookFileUrl: userData.passbookFileUrl || '',
      panFileUrl: userData.panFileUrl || '',
    },
  });

  useEffect(() => {
    if (userData.passbookFileUrl) {
        setPassbookFile({ name: 'passbook.jpg', url: userData.passbookFileUrl });
        setValue('passbookFileUrl', userData.passbookFileUrl);
    }
    if (userData.panFileUrl) {
        setPanFile({ name: 'pan.jpg', url: userData.panFileUrl });
        setValue('panFileUrl', userData.panFileUrl);
    }
  }, [userData, setValue]);

  const saveFileUrlToFirestore = async (fileUrl: string, fieldName: 'passbookFileUrl' | 'panFileUrl') => {
      if (user && firestore) {
          const userDocRef = doc(firestore, 'users', user.uid);
          await setDoc(userDocRef, { [fieldName]: fileUrl }, { merge: true });
      }
  };

  const handlePassbookUpload = (file: { name: string; url: string }) => {
    setPassbookFile(file);
    setValue('passbookFileUrl', file.url);
    saveFileUrlToFirestore(file.url, 'passbookFileUrl');
  };

  const handlePanUpload = (file: { name: string; url: string }) => {
    setPanFile(file);
    setValue('panFileUrl', file.url);
    saveFileUrlToFirestore(file.url, 'panFileUrl');
  };

  const hasBankAccount = watch('hasBankAccount');

  const onSubmit = (data: BankDetailsFormValues) => {
    onNext(data);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-primary">
            Bank Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset disabled={isLocked} className="space-y-6">
              <div className="space-y-2">
                <Label>Do you have Bank Account? *</Label>
                <Controller
                  name="hasBankAccount"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center gap-4 pt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="bank-yes" />
                        <Label htmlFor="bank-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="bank-no" />
                        <Label htmlFor="bank-no">No</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>
              {hasBankAccount === 'Yes' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Type Of Account *</Label>
                    <Controller
                      name="accountType"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Account Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="savings">Savings</SelectItem>
                            <SelectItem value="current">Current</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.accountType && <p className="text-sm text-destructive">{errors.accountType.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number *</Label>
                    <Controller name="accountNumber" control={control} render={({ field }) => <Input {...field} />} />
                     {errors.accountNumber && <p className="text-sm text-destructive">{errors.accountNumber.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Name Of Account Holder *</Label>
                    <Controller name="accountHolderName" control={control} render={({ field }) => <Input {...field} />} />
                    {errors.accountHolderName && <p className="text-sm text-destructive">{errors.accountHolderName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Bank IFSC Code *</Label>
                    <div className="flex items-center gap-2">
                      <Controller name="ifscCode" control={control} render={({ field }) => <Input {...field} />} />
                      <Button type="button" className="bg-yellow-500 hover:bg-yellow-600">Check IFSC Code</Button>
                    </div>
                    {errors.ifscCode && <p className="text-sm text-destructive">{errors.ifscCode.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name *</Label>
                    <Controller name="bankName" control={control} render={({ field }) => <Input {...field} />} />
                     {errors.bankName && <p className="text-sm text-destructive">{errors.bankName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Branch Name *</Label>
                    <Controller name="branchName" control={control} render={({ field }) => <Input {...field} />} />
                    {errors.branchName && <p className="text-sm text-destructive">{errors.branchName.message}</p>}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Upload Bank Passbook Cover Page / Cheque *</Label>
                    <div className="flex gap-2 items-center">
                      <Button type="button" onClick={() => setIsPassbookUploadOpen(true)} variant="outline"><Upload className="mr-2 h-4 w-4" /> Upload</Button>
                      {passbookFile && <Button type="button" variant="link" className="p-0 h-auto text-xs" onClick={() => setViewingFile({...passbookFile, title: "Bank Document"})}>{passbookFile.name}</Button>}
                    </div>
                  </div>
                </div>
              )}
               {hasBankAccount === 'No' && (
                  <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                          <Label>Enter Pan card number *</Label>
                          <Controller name="panNumber" control={control} render={({ field }) => <Input {...field} />} />
                          {errors.panNumber && <p className="text-sm text-destructive">{errors.panNumber.message}</p>}
                      </div>
                      <div className="space-y-2">
                          <Label>Upload Pan card *</Label>
                          <div className="flex gap-2 items-center">
                              <Button type="button" onClick={() => setIsPanUploadOpen(true)} variant="outline"><Upload className="mr-2 h-4 w-4" /> Upload</Button>
                               {panFile && <Button type="button" variant="link" className="p-0 h-auto text-xs" onClick={() => setViewingFile({...panFile, title: "PAN Card"})}>{panFile.name}</Button>}
                          </div>
                      </div>
                  </div>
               )}
            </fieldset>
            <StepButtons onReset={() => reset()} onBack={onBack} />
          </form>
        </CardContent>
      </Card>
      <FileUploadModal
        isOpen={isPassbookUploadOpen}
        onClose={() => setIsPassbookUploadOpen(false)}
        title="Upload Bank Document"
        onFileUpload={handlePassbookUpload}
      />
      <FileUploadModal
        isOpen={isPanUploadOpen}
        onClose={() => setIsPanUploadOpen(false)}
        title="Upload PAN Card"
        onFileUpload={handlePanUpload}
      />
      {viewingFile && (
          <FileViewModal
              isOpen={!!viewingFile}
              onClose={() => setViewingFile(null)}
              title={viewingFile.title}
              fileUrl={viewingFile.url}
          />
      )}
    </>
  );
}
