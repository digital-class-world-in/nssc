
'use client';

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
import { useState, useEffect } from 'react';
import { FileUploadModal } from '../file-upload-modal';
import { FileViewModal } from '../file-view-modal';
import { useUser, initializeFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';


const categorySchema = z.object({
  nationality: z.string(),
  maharashtraDomiciled: z.enum(['Yes', 'No']),
  religion: z.string().min(1, 'Religion is required'),
  casteCategory: z.string().min(1, 'Caste category is required'),
  isPersonWithDisability: z.enum(['Yes', 'No']),
  disabilityType: z.string().optional(),
  domicileFileUrl: z.string().optional(),
  disabilityCertFileUrl: z.string().optional(),
  casteCertFileUrl: z.string().optional(),
  casteValidityCertFileUrl: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryDetailsFormProps {
  userData: any;
  onNext: (data: CategoryFormValues) => void;
  onBack: () => void;
  isLocked: boolean;
}

type FileInfo = { name: string; url: string } | null;

export function CategoryDetailsForm({
  userData,
  onNext,
  onBack,
  isLocked
}: CategoryDetailsFormProps) {
  const { user } = useUser();
  const { firestore } = initializeFirebase();
  const [isDomicileUploadOpen, setIsDomicileUploadOpen] = useState(false);
  const [isDisabilityCertUploadOpen, setIsDisabilityCertUploadOpen] = useState(false);
  const [isCasteCertUploadOpen, setIsCasteCertUploadOpen] = useState(false);
  const [isCasteValidityCertUploadOpen, setIsCasteValidityCertUploadOpen] = useState(false);
  
  const [domicileFile, setDomicileFile] = useState<FileInfo>(null);
  const [disabilityCertFile, setDisabilityCertFile] = useState<FileInfo>(null);
  const [casteCertFile, setCasteCertFile] = useState<FileInfo>(null);
  const [casteValidityCertFile, setCasteValidityCertFile] = useState<FileInfo>(null);

  
  const [viewingFile, setViewingFile] = useState<FileInfo & { title: string } | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nationality: 'India',
      maharashtraDomiciled: userData.maharashtraDomiciled || 'Yes',
      religion: userData.religion || '',
      casteCategory: userData.casteCategory || '',
      isPersonWithDisability: userData.isPersonWithDisability || 'No',
      disabilityType: userData.disabilityType || '',
      domicileFileUrl: userData.domicileFileUrl || '',
      disabilityCertFileUrl: userData.disabilityCertFileUrl || '',
      casteCertFileUrl: userData.casteCertFileUrl || '',
      casteValidityCertFileUrl: userData.casteValidityCertFileUrl || '',
    },
  });

  useEffect(() => {
    if (userData.domicileFileUrl) setDomicileFile({ name: 'domicile.jpg', url: userData.domicileFileUrl });
    if (userData.disabilityCertFileUrl) setDisabilityCertFile({ name: 'disability.jpg', url: userData.disabilityCertFileUrl });
    if (userData.casteCertFileUrl) setCasteCertFile({ name: 'caste.jpg', url: userData.casteCertFileUrl });
    if (userData.casteValidityCertFileUrl) setCasteValidityCertFile({ name: 'caste_validity.jpg', url: userData.casteValidityCertFileUrl });
    
    setValue('domicileFileUrl', userData.domicileFileUrl || '');
    setValue('disabilityCertFileUrl', userData.disabilityCertFileUrl || '');
    setValue('casteCertFileUrl', userData.casteCertFileUrl || '');
    setValue('casteValidityCertFileUrl', userData.casteValidityCertFileUrl || '');
  }, [userData, setValue]);

  const saveFileUrlToFirestore = async (fileUrl: string, fieldName: keyof CategoryFormValues) => {
      if (user && firestore) {
          const userDocRef = doc(firestore, 'users', user.uid);
          await setDoc(userDocRef, { [fieldName]: fileUrl }, { merge: true });
      }
  };
  
  const handleDomicileUpload = (file: { name: string; url: string }) => {
    setDomicileFile(file);
    setValue('domicileFileUrl', file.url);
    saveFileUrlToFirestore(file.url, 'domicileFileUrl');
  };
  
  const handleDisabilityUpload = (file: { name: string; url: string }) => {
    setDisabilityCertFile(file);
    setValue('disabilityCertFileUrl', file.url);
    saveFileUrlToFirestore(file.url, 'disabilityCertFileUrl');
  };

  const handleCasteCertUpload = (file: { name: string; url: string }) => {
    setCasteCertFile(file);
    setValue('casteCertFileUrl', file.url);
    saveFileUrlToFirestore(file.url, 'casteCertFileUrl');
  };

  const handleCasteValidityCertUpload = (file: { name: string; url: string }) => {
    setCasteValidityCertFile(file);
    setValue('casteValidityCertFileUrl', file.url);
    saveFileUrlToFirestore(file.url, 'casteValidityCertFileUrl');
  };

  const isPersonWithDisability = watch('isPersonWithDisability');
  const isMaharashtraDomiciled = watch('maharashtraDomiciled');
  const casteCategory = watch('casteCategory');

  const onSubmit = (data: CategoryFormValues) => {
    onNext(data);
  };

  const isNextDisabled = isMaharashtraDomiciled === 'Yes' && !domicileFile;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-primary">
            Category Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset disabled={isLocked} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality *</Label>
                <Controller
                  name="nationality"
                  control={control}
                  render={({ field }) => (
                    <Input id="nationality" {...field} readOnly disabled />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Are you Maharashtra Domiciled? *</Label>
                 <div className="flex items-center gap-4 flex-wrap">
                    <Controller
                    name="maharashtraDomiciled"
                    control={control}
                    render={({ field }) => (
                        <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex items-center gap-4 pt-2"
                        >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="domiciled-yes" />
                            <Label htmlFor="domiciled-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="domiciled-no" />
                            <Label htmlFor="domiciled-no">No</Label>
                        </div>
                        </RadioGroup>
                    )}
                    />
                    <div className="flex items-center gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => setIsDomicileUploadOpen(true)}><Upload className="mr-2 h-4 w-4" /> Upload Domicile</Button>
                        {domicileFile && <Button type="button" variant="link" className="p-0 h-auto text-xs" onClick={() => setViewingFile({...domicileFile, title: "Domicile Certificate"})}>{domicileFile.name}</Button>}
                    </div>
                </div>
                 {isMaharashtraDomiciled === 'Yes' && !domicileFile && (
                    <p className="text-sm text-destructive">Domicile certificate is mandatory for Maharashtra candidates.</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="religion">Religion *</Label>
                <Controller
                  name="religion"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Religion" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hindu">Hindu</SelectItem>
                        <SelectItem value="muslim">Muslim</SelectItem>
                        <SelectItem value="christian">Christian</SelectItem>
                        <SelectItem value="sikh">Sikh</SelectItem>
                        <SelectItem value="buddhist">Buddhist</SelectItem>
                        <SelectItem value="jain">Jain</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.religion && (
                  <p className="text-sm text-destructive">
                    {errors.religion.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="casteCategory">Caste Category *</Label>
                <Controller
                  name="casteCategory"
                  control={control}
                  render={({ field }) => (
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Caste" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="obc">OBC</SelectItem>
                        <SelectItem value="sc">SC</SelectItem>
                        <SelectItem value="st">ST</SelectItem>
                        <SelectItem value="vj">VJ/DT(A)</SelectItem>
                        <SelectItem value="nt-b">NT-B</SelectItem>
                        <SelectItem value="nt-c">NT-C</SelectItem>
                        <SelectItem value="nt-d">NT-D</SelectItem>
                        <SelectItem value="sbc">SBC</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                 {errors.casteCategory && (
                  <p className="text-sm text-destructive">
                    {errors.casteCategory.message}
                  </p>
                )}
              </div>

              {casteCategory && casteCategory !== 'open' && (
                <>
                  <div className="space-y-2">
                    <Label>Caste Certificate *</Label>
                    <div className="flex items-center gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => setIsCasteCertUploadOpen(true)}><Upload className="mr-2 h-4 w-4" /> Upload Caste Cert.</Button>
                      {casteCertFile && <Button type="button" variant="link" className="p-0 h-auto text-xs" onClick={() => setViewingFile({...casteCertFile, title: "Caste Certificate"})}>{casteCertFile.name}</Button>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Caste Validity Certificate *</Label>
                    <div className="flex items-center gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => setIsCasteValidityCertUploadOpen(true)}><Upload className="mr-2 h-4 w-4" /> Upload Validity Cert.</Button>
                      {casteValidityCertFile && <Button type="button" variant="link" className="p-0 h-auto text-xs" onClick={() => setViewingFile({...casteValidityCertFile, title: "Caste Validity Certificate"})}>{casteValidityCertFile.name}</Button>}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="space-y-4 pt-4 border-t">
                 <h3 className="font-semibold text-foreground/90">Person With Disability Category Details</h3>
                 <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Label>Do you belong to Person with Disability Category? *</Label>
                        <Controller
                        name="isPersonWithDisability"
                        control={control}
                        render={({ field }) => (
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-4 pt-2"
                            >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Yes" id="pwd-yes" />
                                <Label htmlFor="pwd-yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="No" id="pwd-no" />
                                <Label htmlFor="pwd-no">No</Label>
                            </div>
                            </RadioGroup>
                        )}
                        />
                    </div>
                 </div>
                 {isPersonWithDisability === 'Yes' && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Disability Type</Label>
                             <Controller
                                name="disabilityType"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Disability Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="visual">Visual</SelectItem>
                                            <SelectItem value="hearing">Hearing</SelectItem>
                                            <SelectItem value="locomotor">Locomotor</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Disability Certificate</Label>
                             <div className="flex items-center gap-2">
                                <Button type="button" className="block" variant="outline" onClick={() => setIsDisabilityCertUploadOpen(true)}><Upload className="mr-2 h-4 w-4" /> Upload Certificate</Button>
                                {disabilityCertFile && <Button type="button" variant="link" className="p-0 h-auto text-xs" onClick={() => setViewingFile({...disabilityCertFile, title: "Disability Certificate"})}>{disabilityCertFile.name}</Button>}
                            </div>
                        </div>
                     </div>
                 )}
            </div>
            </fieldset>
            <StepButtons onReset={() => reset()} onBack={onBack} isNextDisabled={isNextDisabled} />
          </form>
        </CardContent>
      </Card>
      <FileUploadModal
        isOpen={isDomicileUploadOpen}
        onClose={() => setIsDomicileUploadOpen(false)}
        title="Upload Domicile Certificate"
        onFileUpload={handleDomicileUpload}
      />
      <FileUploadModal
        isOpen={isDisabilityCertUploadOpen}
        onClose={() => setIsDisabilityCertUploadOpen(false)}
        title="Upload Disability Certificate"
        onFileUpload={handleDisabilityUpload}
      />
      <FileUploadModal
        isOpen={isCasteCertUploadOpen}
        onClose={() => setIsCasteCertUploadOpen(false)}
        title="Upload Caste Certificate"
        onFileUpload={handleCasteCertUpload}
      />
      <FileUploadModal
        isOpen={isCasteValidityCertUploadOpen}
        onClose={() => setIsCasteValidityCertUploadOpen(false)}
        title="Upload Caste Validity Certificate"
        onFileUpload={handleCasteValidityCertUpload}
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

    
