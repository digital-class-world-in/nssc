
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StepButtons } from './step-buttons';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { states, districts as allDistricts, talukas as allTalukas } from '@/lib/locations';
import { useState, useEffect } from 'react';

const addressSchema = z.object({
    correspondenceAddress: z.string().min(1, 'Address is required'),
    correspondencePincode: z.string().regex(/^\d{6}$/, 'Invalid Pincode'),
    correspondenceState: z.string().min(1, 'State is required'),
    correspondenceDistrict: z.string().min(1, 'District is required'),
    correspondenceTaluka: z.string().min(1, 'Taluka is required'),
    correspondenceCity: z.string().min(1, 'City/Village is required'),
    isSameAddress: z.boolean(),
    permanentAddress: z.string().optional(),
    permanentPincode: z.string().optional(),
    permanentState: z.string().optional(),
    permanentDistrict: z.string().optional(),
    permanentTaluka: z.string().optional(),
    permanentCity: z.string().optional(),
}).refine((data) => {
    if (!data.isSameAddress) {
        return (
            data.permanentAddress &&
            data.permanentPincode &&
            data.permanentState &&
            data.permanentDistrict &&
            data.permanentTaluka &&
            data.permanentCity
        );
    }
    return true;
}, {
    message: "Permanent address fields are required when the address is not the same.",
    path: ["permanentAddress"],
});


type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressDetailsFormProps {
  userData: any;
  onNext: (data: AddressFormValues) => void;
  onBack: () => void;
  isLocked: boolean;
}

export function AddressDetailsForm({ userData, onNext, onBack, isLocked }: AddressDetailsFormProps) {
  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      correspondenceAddress: userData.correspondenceAddress || '',
      correspondencePincode: userData.correspondencePincode || '',
      correspondenceState: userData.correspondenceState || '',
      correspondenceDistrict: userData.correspondenceDistrict || '',
      correspondenceTaluka: userData.correspondenceTaluka || '',
      correspondenceCity: userData.correspondenceCity || '',
      isSameAddress: userData.isSameAddress || false,
      permanentAddress: userData.permanentAddress || '',
      permanentPincode: userData.permanentPincode || '',
      permanentState: userData.permanentState || '',
      permanentDistrict: userData.permanentDistrict || '',
      permanentTaluka: userData.permanentTaluka || '',
      permanentCity: userData.permanentCity || '',
    },
  });

  const isSameAddress = watch('isSameAddress');
  
  const correspondenceState = watch('correspondenceState');
  const correspondenceDistrict = watch('correspondenceDistrict');
  
  const permanentState = watch('permanentState');
  const permanentDistrict = watch('permanentDistrict');
  
  const [correspondenceDistricts, setCorrespondenceDistricts] = useState<{ value: string; label: string; }[]>([]);
  const [correspondenceTalukas, setCorrespondenceTalukas] = useState<{ value: string; label: string; }[]>([]);

  const [permanentDistricts, setPermanentDistricts] = useState<{ value: string; label: string; }[]>([]);
  const [permanentTalukas, setPermanentTalukas] = useState<{ value: string; label: string; }[]>([]);


  useEffect(() => {
    if (correspondenceState) {
        const filteredDistricts = allDistricts.filter(d => d.state === correspondenceState);
        setCorrespondenceDistricts(filteredDistricts);
        if(!filteredDistricts.find(d => d.value === correspondenceDistrict)) {
            setValue('correspondenceDistrict', '');
            setValue('correspondenceTaluka', '');
            setValue('correspondenceCity', '');
        }
    } else {
        setCorrespondenceDistricts([]);
    }
  }, [correspondenceState, correspondenceDistrict, setValue]);

  useEffect(() => {
    if (correspondenceDistrict) {
        const filteredTalukas = allTalukas.filter(t => t.district === correspondenceDistrict);
        setCorrespondenceTalukas(filteredTalukas);
        if(!filteredTalukas.find(t => t.value === watch('correspondenceTaluka'))) {
          setValue('correspondenceTaluka', '');
          setValue('correspondenceCity', '');
        }
    } else {
        setCorrespondenceTalukas([]);
    }
  }, [correspondenceDistrict, setValue, watch]);

  useEffect(() => {
    if (permanentState) {
        const filteredDistricts = allDistricts.filter(d => d.state === permanentState);
        setPermanentDistricts(filteredDistricts);
        if(!filteredDistricts.find(d => d.value === permanentDistrict)) {
            setValue('permanentDistrict', '');
            setValue('permanentTaluka', '');
            setValue('permanentCity', '');
        }
    } else {
        setPermanentDistricts([]);
    }
  }, [permanentState, permanentDistrict, setValue]);

  useEffect(() => {
    if (permanentDistrict) {
        const filteredTalukas = allTalukas.filter(t => t.district === permanentDistrict);
        setPermanentTalukas(filteredTalukas);
         if(!filteredTalukas.find(t => t.value === watch('permanentTaluka'))) {
            setValue('permanentTaluka', '');
            setValue('permanentCity', '');
        }
    } else {
        setPermanentTalukas([]);
    }
  }, [permanentDistrict, setValue, watch]);


  const onSubmit = (data: AddressFormValues) => {
    if (data.isSameAddress) {
        data.permanentAddress = data.correspondenceAddress;
        data.permanentPincode = data.correspondencePincode;
        data.permanentState = data.correspondenceState;
        data.permanentDistrict = data.correspondenceDistrict;
        data.permanentTaluka = data.correspondenceTaluka;
        data.permanentCity = data.correspondenceCity;
    }
    onNext(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-primary">Address Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={isLocked} className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground/90 mb-4">Correspondence Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="correspondenceAddress">Address *</Label>
                  <Controller name="correspondenceAddress" control={control} render={({ field }) => <Input id="correspondenceAddress" {...field} />} />
                  {errors.correspondenceAddress && <p className="text-sm text-destructive">{errors.correspondenceAddress.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="correspondencePincode">Pincode *</Label>
                   <Controller name="correspondencePincode" control={control} render={({ field }) => <Input id="correspondencePincode" {...field} />} />
                   {errors.correspondencePincode && <p className="text-sm text-destructive">{errors.correspondencePincode.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="correspondenceState">State *</Label>
                  <Controller name="correspondenceState" control={control} render={({ field }) => (
                     <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                        <SelectContent>{states.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
                   {errors.correspondenceState && <p className="text-sm text-destructive">{errors.correspondenceState.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="correspondenceDistrict">District *</Label>
                   <Controller name="correspondenceDistrict" control={control} render={({ field }) => (
                     <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                        <SelectContent>{correspondenceDistricts.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
                   {errors.correspondenceDistrict && <p className="text-sm text-destructive">{errors.correspondenceDistrict.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="correspondenceTaluka">Taluka *</Label>
                   <Controller name="correspondenceTaluka" control={control} render={({ field }) => (
                     <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select Taluka" /></SelectTrigger>
                        <SelectContent>{correspondenceTalukas.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
                   {errors.correspondenceTaluka && <p className="text-sm text-destructive">{errors.correspondenceTaluka.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="correspondenceCity">City/Village *</Label>
                    <Controller name="correspondenceCity" control={control} render={({ field }) => <Input id="correspondenceCity" {...field} />} />
                    {errors.correspondenceCity && <p className="text-sm text-destructive">{errors.correspondenceCity.message}</p>}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground/90">Permanent Address</h3>
              <div className="flex items-center space-x-2">
                <Controller
                    name="isSameAddress"
                    control={control}
                    render={({ field }) => (
                        <Checkbox
                            id="isSameAddress"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    )}
                />
                <Label htmlFor="isSameAddress">Same as Correspondence Address</Label>
              </div>
               {!isSameAddress && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="permanentAddress">Address *</Label>
                      <Controller name="permanentAddress" control={control} render={({ field }) => <Input id="permanentAddress" {...field} />} />
                      {errors.permanentAddress && <p className="text-sm text-destructive">{errors.permanentAddress.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="permanentPincode">Pincode *</Label>
                      <Controller name="permanentPincode" control={control} render={({ field }) => <Input id="permanentPincode" {...field} />} />
                      {errors.permanentPincode && <p className="text-sm text-destructive">{errors.permanentPincode.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="permanentState">State *</Label>
                      <Controller name="permanentState" control={control} render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                              <SelectContent>{states.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                          </Select>
                      )} />
                      {errors.permanentState && <p className="text-sm text-destructive">{errors.permanentState.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="permanentDistrict">District *</Label>
                      <Controller name="permanentDistrict" control={control} render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                              <SelectContent>{permanentDistricts.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                          </Select>
                      )} />
                      {errors.permanentDistrict && <p className="text-sm text-destructive">{errors.permanentDistrict.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="permanentTaluka">Taluka *</Label>
                      <Controller name="permanentTaluka" control={control} render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger><SelectValue placeholder="Select Taluka" /></SelectTrigger>
                              <SelectContent>{permanentTalukas.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                          </Select>
                      )} />
                      {errors.permanentTaluka && <p className="text-sm text-destructive">{errors.permanentTaluka.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="permanentCity">City/Village *</Label>
                        <Controller name="permanentCity" control={control} render={({ field }) => <Input id="permanentCity" {...field} />} />
                        {errors.permanentCity && <p className="text-sm text-destructive">{errors.permanentCity.message}</p>}
                    </div>
                </div>
               )}
            </div>
          </fieldset>
          <StepButtons onReset={() => reset()} onBack={onBack} />
        </form>
      </CardContent>
    </Card>
  );
}
