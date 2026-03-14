
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StepButtons } from './step-buttons';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const parentDetailsSchema = z.object({
  orphan: z.string().min(1, 'Orphan status is required'),
  fatherFirstName: z.string().min(1, 'Father\'s first name is required'),
  fatherMiddleName: z.string().optional(),
  fatherLastName: z.string().min(1, 'Father\'s last name is required'),
  motherFirstName: z.string().min(1, 'Mother\'s first name is required'),
  motherMiddleName: z.string().optional(),
  motherLastName: z.string().min(1, 'Mother\'s last name is required'),
  maritalStatus: z.string().min(1, 'Marital status is required'),
  spouseFirstName: z.string().optional(),
  spouseMiddleName: z.string().optional(),
  spouseLastName: z.string().optional(),
});

type ParentDetailsFormValues = z.infer<typeof parentDetailsSchema>;

interface ParentDetailsFormProps {
  userData: any;
  onNext: (data: ParentDetailsFormValues) => void;
  onBack: () => void;
  isLocked: boolean;
}

export function ParentDetailsForm({ userData, onNext, onBack, isLocked }: ParentDetailsFormProps) {
  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<ParentDetailsFormValues>({
    resolver: zodResolver(parentDetailsSchema),
    defaultValues: {
      orphan: userData.orphan || 'No',
      fatherFirstName: userData.fatherFirstName || '',
      fatherMiddleName: userData.fatherMiddleName || '',
      fatherLastName: userData.fatherLastName || '',
      motherFirstName: userData.motherFirstName || '',
      motherMiddleName: userData.motherMiddleName || '',
      motherLastName: userData.motherLastName || '',
      maritalStatus: userData.maritalStatus || '',
      spouseFirstName: userData.spouseFirstName || '',
      spouseMiddleName: userData.spouseMiddleName || '',
      spouseLastName: userData.spouseLastName || '',
    },
  });

  const maritalStatus = watch('maritalStatus');

  const onSubmit = (data: ParentDetailsFormValues) => {
    onNext(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-primary">Parent / Guardian Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={isLocked} className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground/90 mb-4">Parent / Guardian Details</h3>
              <div className="space-y-4">
                 <div className="space-y-2">
                  <Label>Orphan Candidate *</Label>
                  <Controller
                    name="orphan"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="orphan-yes" />
                          <Label htmlFor="orphan-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="orphan-no" />
                          <Label htmlFor="orphan-no">No</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {errors.orphan && <p className="text-sm text-destructive">{errors.orphan.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fatherFirstName">Father's First Name *</Label>
                    <Controller name="fatherFirstName" control={control} render={({ field }) => <Input id="fatherFirstName" {...field} />} />
                    {errors.fatherFirstName && <p className="text-sm text-destructive">{errors.fatherFirstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatherMiddleName">Father's Middle/ Father/ Husband Name</Label>
                    <Controller name="fatherMiddleName" control={control} render={({ field }) => <Input id="fatherMiddleName" {...field} />} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatherLastName">Father's Last/ Surname</Label>
                    <Controller name="fatherLastName" control={control} render={({ field }) => <Input id="fatherLastName" {...field} />} />
                     {errors.fatherLastName && <p className="text-sm text-destructive">{errors.fatherLastName.message}</p>}
                  </div>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="motherFirstName">Mother's First Name *</Label>
                    <Controller name="motherFirstName" control={control} render={({ field }) => <Input id="motherFirstName" {...field} />} />
                    {errors.motherFirstName && <p className="text-sm text-destructive">{errors.motherFirstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motherMiddleName">Mother's Middle/ Father/ Husband Name</Label>
                    <Controller name="motherMiddleName" control={control} render={({ field }) => <Input id="motherMiddleName" {...field} />} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motherLastName">Mother's Last/ Surname</Label>
                    <Controller name="motherLastName" control={control} render={({ field }) => <Input id="motherLastName" {...field} />} />
                     {errors.motherLastName && <p className="text-sm text-destructive">{errors.motherLastName.message}</p>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground/90">Marital Status Details</h3>
              <div className="space-y-2">
                  <Label>Marital Status *</Label>
                  <Controller
                    name="maritalStatus"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Married" id="marital-married" />
                          <Label htmlFor="marital-married">Married</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Unmarried" id="marital-unmarried" />
                          <Label htmlFor="marital-unmarried">Unmarried</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {errors.maritalStatus && <p className="text-sm text-destructive">{errors.maritalStatus.message}</p>}
                </div>

                {maritalStatus === 'Married' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="spouseFirstName">Spouse's First Name *</Label>
                      <Controller name="spouseFirstName" control={control} render={({ field }) => <Input id="spouseFirstName" {...field} />} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="spouseMiddleName">Spouse's Middle Name</Label>
                      <Controller name="spouseMiddleName" control={control} render={({ field }) => <Input id="spouseMiddleName" {...field} />} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="spouseLastName">Spouse's Last Name</Label>
                      <Controller name="spouseLastName" control={control} render={({ field }) => <Input id="spouseLastName" {...field} />} />
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

    
