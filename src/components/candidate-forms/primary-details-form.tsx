
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileUploadModal } from '@/components/file-upload-modal';
import { StepButtons } from './step-buttons';
import { FileViewModal } from '../file-view-modal';
import Image from 'next/image';

const primaryDetailsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.string(),
  dob: z.date(),
  aadhaarNumber: z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
  primaryMobile: z.string(),
  secondaryMobile: z.string().optional(),
  email: z.string().email(),
  photoUrl: z.string().min(1, "Photo is required."),
  signUrl: z.string().min(1, "Signature is required."),
});

type PrimaryDetailsFormValues = z.infer<typeof primaryDetailsSchema>;

interface PrimaryDetailsFormProps {
  userData: any;
  onNext: (data: Partial<PrimaryDetailsFormValues>) => void;
  isLocked: boolean;
}

type FileInfo = { name: string; url: string } | null;

export function PrimaryDetailsForm({ userData, onNext, isLocked }: PrimaryDetailsFormProps) {
    const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);
    const [isSignUploadOpen, setIsSignUploadOpen] = useState(false);
    const [isAadhaarFrontUploadOpen, setIsAadhaarFrontUploadOpen] = useState(false);
    const [isAadhaarBackUploadOpen, setIsAadhaarBackUploadOpen] = useState(false);
    
    const [photoFile, setPhotoFile] = useState<FileInfo>(userData.photoUrl ? { name: 'photo.jpg', url: userData.photoUrl } : null);
    const [signFile, setSignFile] = useState<FileInfo>(userData.signUrl ? { name: 'signature.jpg', url: userData.signUrl } : null);
    const [aadhaarFrontFile, setAadhaarFrontFile] = useState<FileInfo>(null);
    const [aadhaarBackFile, setAadhaarBackFile] = useState<FileInfo>(null);
    
    const [viewingFile, setViewingFile] = useState<FileInfo & { title: string } | null>(null);

    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<PrimaryDetailsFormValues>({
        resolver: zodResolver(primaryDetailsSchema),
        defaultValues: {
            firstName: userData.firstName || '',
            middleName: userData.middleName || '',
            lastName: userData.lastName || '',
            gender: userData.gender || '',
            dob: userData.dob ? new Date(userData.dob) : undefined,
            aadhaarNumber: userData.aadhaarNumber || '',
            primaryMobile: userData.primaryMobile || '',
            secondaryMobile: userData.secondaryMobile || '',
            email: userData.email || '',
            photoUrl: userData.photoUrl || '',
            signUrl: userData.signUrl || '',
        },
    });

    const handlePhotoUpload = (file: { name: string; url: string }) => {
        setPhotoFile(file);
        setValue('photoUrl', file.url, { shouldValidate: true });
    };

    const handleSignUpload = (file: { name: string; url: string }) => {
        setSignFile(file);
        setValue('signUrl', file.url, { shouldValidate: true });
    };

    const onSubmit = (data: PrimaryDetailsFormValues) => {
        onNext(data);
    };

    return (
        <>
            <Card>
                <CardHeader>
                <CardTitle className="text-lg font-bold text-primary">Primary Details</CardTitle>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <fieldset disabled={isLocked} className="space-y-6">
                        <h3 className="font-semibold text-foreground/90">Candidate Profile</h3>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            <div className="md:col-span-9 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="first-name">First Name *</Label>
                                        <Controller
                                            name="firstName"
                                            control={control}
                                            render={({ field }) => <Input id="first-name" {...field} />}
                                        />
                                         {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="middle-name">Middle / Father / Husband Name</Label>
                                         <Controller
                                            name="middleName"
                                            control={control}
                                            render={({ field }) => <Input id="middle-name" {...field} />}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last-name">Last / Surname</Label>
                                         <Controller
                                            name="lastName"
                                            control={control}
                                            render={({ field }) => <Input id="last-name" {...field} />}
                                        />
                                        {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="gender">Gender *</Label>
                                        <Controller
                                            name="gender"
                                            control={control}
                                            render={({ field }) => <Input id="gender" readOnly disabled {...field} />}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                    <Label htmlFor="dob">Date of Birth (DD/MM/YYYY) *</Label>
                                    <Controller
                                        name="dob"
                                        control={control}
                                        render={({ field }) => (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                    variant={'outline'}
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}
                                                    >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(field.value, 'dd/MM/yyyy') : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    />
                                     {errors.dob && <p className="text-sm text-destructive">{errors.dob.message}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="aadhaar">Aadhaar Number *</Label>
                                        <Controller
                                            name="aadhaarNumber"
                                            control={control}
                                            render={({ field }) => <Input id="aadhaar" placeholder="Enter Aadhaar Number" {...field} />}
                                        />
                                        {errors.aadhaarNumber && <p className="text-sm text-destructive">{errors.aadhaarNumber.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Upload Aadhaar Card *</Label>
                                        <div className="flex gap-4 items-center flex-wrap">
                                            <div className='flex gap-2 items-center'>
                                                <Button type="button" size="sm" variant="outline" onClick={() => setIsAadhaarFrontUploadOpen(true)}><Upload className="mr-2 h-4 w-4" /> Front</Button>
                                                {aadhaarFrontFile && <Button type="button" variant="link" className="p-0 h-auto text-xs" onClick={() => setViewingFile({...aadhaarFrontFile, title: "Aadhaar Card (Front)"})}>{aadhaarFrontFile.name}</Button>}
                                            </div>
                                             <div className='flex gap-2 items-center'>
                                                <Button type="button" size="sm" variant="outline" onClick={() => setIsAadhaarBackUploadOpen(true)}><Upload className="mr-2 h-4 w-4" /> Back</Button>
                                                {aadhaarBackFile && <Button type="button" variant="link" className="p-0 h-auto text-xs" onClick={() => setViewingFile({...aadhaarBackFile, title: "Aadhaar Card (Back)"})}>{aadhaarBackFile.name}</Button>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="primary-mobile">Primary Mobile Number *</Label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+91</span>
                                            <Controller
                                                name="primaryMobile"
                                                control={control}
                                                render={({ field }) =>  <Input id="primary-mobile" className="rounded-l-none" readOnly disabled {...field} />}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                    <Label htmlFor="secondary-mobile">Secondary Mobile Number</Label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+91</span>
                                         <Controller
                                            name="secondaryMobile"
                                            control={control}
                                            render={({ field }) => <Input id="secondary-mobile" className="rounded-l-none" {...field} />}
                                        />
                                    </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">E-Mail ID *</Label>
                                    <Controller
                                        name="email"
                                        control={control}
                                        render={({ field }) => <Input id="email" type="email" readOnly disabled {...field} />}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-3 space-y-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-32 h-40 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50 relative overflow-hidden">
                                        {photoFile ? (
                                            <Image src={photoFile.url} alt="Photo preview" fill className="object-cover" />
                                        ) : (
                                            <span className="text-xs text-gray-400">Photo</span>
                                        )}
                                    </div>
                                    <Button variant="outline" className="mt-2 w-full" type="button" onClick={() => setIsPhotoUploadOpen(true)}><Upload className="mr-2 h-4 w-4" /> Upload Photo</Button>
                                    {photoFile && <Button type="button" variant="link" className="p-0 h-auto text-xs mt-1" onClick={() => setViewingFile({...photoFile, title: "Candidate Photo"})}>{photoFile.name}</Button>}
                                    {errors.photoUrl && <p className="text-sm text-destructive mt-1">{errors.photoUrl.message}</p>}
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-32 h-16 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50 relative overflow-hidden">
                                         {signFile ? (
                                            <Image src={signFile.url} alt="Signature preview" fill className="object-contain p-1" />
                                        ) : (
                                            <span className="text-xs text-gray-400">Sign</span>
                                        )}
                                    </div>
                                    <Button variant="outline" className="mt-2 w-full" type="button" onClick={() => setIsSignUploadOpen(true)}><Upload className="mr-2 h-4 w-4" /> Upload Sign</Button>
                                    {signFile && <Button type="button" variant="link" className="p-0 h-auto text-xs mt-1" onClick={() => setViewingFile({...signFile, title: "Candidate Signature"})}>{signFile.name}</Button>}
                                    {errors.signUrl && <p className="text-sm text-destructive mt-1">{errors.signUrl.message}</p>}
                                </div>
                            </div>
                        </div>
                    </fieldset>
                     <StepButtons onReset={() => reset()} />
                </form>
                </CardContent>
            </Card>
            <FileUploadModal
                isOpen={isPhotoUploadOpen}
                onClose={() => setIsPhotoUploadOpen(false)}
                title="Upload Photo"
                onFileUpload={handlePhotoUpload}
            />
            <FileUploadModal
                isOpen={isSignUploadOpen}
                onClose={() => setIsSignUploadOpen(false)}
                title="Upload Sign"
                onFileUpload={handleSignUpload}
            />
            <FileUploadModal
                isOpen={isAadhaarFrontUploadOpen}
                onClose={() => setIsAadhaarFrontUploadOpen(false)}
                title="Upload Aadhaar Card (Front)"
                onFileUpload={setAadhaarFrontFile}
            />
             <FileUploadModal
                isOpen={isAadhaarBackUploadOpen}
                onClose={() => setIsAadhaarBackUploadOpen(false)}
                title="Upload Aadhaar Card (Back)"
                onFileUpload={setAadhaarBackFile}
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
