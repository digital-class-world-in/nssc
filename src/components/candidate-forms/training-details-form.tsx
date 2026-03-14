
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StepButtons } from './step-buttons';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Upload } from 'lucide-react';
import { FileUploadModal } from '../file-upload-modal';
import { useState } from 'react';

const trainingSchema = z.object({
  completedTraining: z.enum(['Yes', 'No']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  certificateUrl: z.string().optional(),
});

type TrainingFormValues = z.infer<typeof trainingSchema>;

interface TrainingDetailsFormProps {
  userData: any;
  onNext: (data: TrainingFormValues) => void;
  onBack: () => void;
  isLocked: boolean;
}

type FileInfo = { name: string; url: string } | null;

export function TrainingDetailsForm({
  userData,
  onNext,
  onBack,
  isLocked
}: TrainingDetailsFormProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [certificateFile, setCertificateFile] = useState<FileInfo>(null);
  
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue
  } = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      completedTraining: userData.completedTraining || 'No',
      startDate: userData.startDate || '',
      endDate: userData.endDate || '',
      certificateUrl: userData.certificateUrl || '',
    },
  });

  const completedTraining = watch('completedTraining');
  
  const handleFileUpload = (file: {name: string, url: string}) => {
    setCertificateFile(file);
    setValue('certificateUrl', file.url);
  };

  const onSubmit = (data: TrainingFormValues) => {
    onNext(data);
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-primary">
          Training Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={isLocked} className="space-y-6">
            <div className="space-y-2">
              <Label>Have you completed any training? *</Label>
              <Controller
                name="completedTraining"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex items-center gap-4 pt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="training-yes" />
                      <Label htmlFor="training-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="training-no" />
                      <Label htmlFor="training-no">No</Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>

            {completedTraining === 'Yes' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Controller name="startDate" control={control} render={({ field }) => <Input type="date" {...field} />} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Controller name="endDate" control={control} render={({ field }) => <Input type="date" {...field} />} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Upload Certificate</Label>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsUploadOpen(true)}>
                      <Upload className="mr-2 h-4 w-4" /> Upload
                    </Button>
                    {certificateFile && <span>{certificateFile.name}</span>}
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
      isOpen={isUploadOpen}
      onClose={() => setIsUploadOpen(false)}
      title="Upload Training Certificate"
      onFileUpload={handleFileUpload}
    />
    </>
  );
}
