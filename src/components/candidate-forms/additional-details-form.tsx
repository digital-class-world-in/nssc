
'use client';

import { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { StepButtons } from './step-buttons';
import { Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { languages as languageList } from '@/lib/locations';


const languageSchema = z.object({
    name: z.string().min(1, "Language name is required"),
    read: z.boolean(),
    write: z.boolean(),
    speak: z.boolean(),
});

type LanguageEntry = z.infer<typeof languageSchema>;

const additionalDetailsSchema = z.object({
    bloodGroup: z.string().optional(),
    motherTongue: z.string().min(1, "Mother tongue is required"),
    languages: z.array(languageSchema),
});

type AdditionalDetailsFormValues = z.infer<typeof additionalDetailsSchema>;

interface AdditionalDetailsFormProps {
  userData: any;
  onNext: (data: AdditionalDetailsFormValues) => void;
  onBack: () => void;
  isLocked: boolean;
}

export function AdditionalDetailsForm({
  userData,
  onNext,
  onBack,
  isLocked
}: AdditionalDetailsFormProps) {
    const [languages, setLanguages] = useState<LanguageEntry[]>(userData.languages || []);
    const [currentLanguage, setCurrentLanguage] = useState('');
    const [canRead, setCanRead] = useState(false);
    const [canWrite, setCanWrite] = useState(false);
    const [canSpeak, setCanSpeak] = useState(false);

    const { control, handleSubmit, reset, getValues, setValue } = useForm<AdditionalDetailsFormValues>({
        resolver: zodResolver(additionalDetailsSchema),
        defaultValues: {
            bloodGroup: userData.bloodGroup || '',
            motherTongue: userData.motherTongue || '',
            languages: userData.languages || [],
        },
    });

    const handleAddLanguage = () => {
        if (currentLanguage.trim()) {
            const newLanguage: LanguageEntry = {
                name: currentLanguage,
                read: canRead,
                write: canWrite,
                speak: canSpeak,
            };
            const newLanguages = [...languages, newLanguage];
            setLanguages(newLanguages);
            setValue('languages', newLanguages);

            // Reset inputs
            setCurrentLanguage('');
            setCanRead(false);
            setCanWrite(false);
            setCanSpeak(false);
        }
    };
    
    const handleRemoveLanguage = (index: number) => {
        const newLanguages = languages.filter((_, i) => i !== index);
        setLanguages(newLanguages);
        setValue('languages', newLanguages);
    };

    const onSubmit = (data: AdditionalDetailsFormValues) => {
        onNext(data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-bold text-primary">Additional Details</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <fieldset disabled={isLocked} className="space-y-6">
                        <div className='border-b pb-6 space-y-4'>
                            <h3 className="font-semibold text-foreground/90">Ancillary Details</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Blood Group</Label>
                                    <Controller name="bloodGroup" control={control} render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger><SelectValue placeholder="Select Blood Group" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A+">A+</SelectItem>
                                                <SelectItem value="A-">A-</SelectItem>
                                                <SelectItem value="B+">B+</SelectItem>
                                                <SelectItem value="B-">B-</SelectItem>
                                                <SelectItem value="AB+">AB+</SelectItem>
                                                <SelectItem value="AB-">AB-</SelectItem>
                                                <SelectItem value="O+">O+</SelectItem>
                                                <SelectItem value="O-">O-</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mother Tongue *</Label>
                                    <Controller name="motherTongue" control={control} render={({ field }) => (
                                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger><SelectValue placeholder="Select Mother Tongue" /></SelectTrigger>
                                            <SelectContent>
                                                {languageList.map(lang => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )} />
                                </div>
                            </div>

                            <div>
                                <Label>Languages Known *</Label>
                                <div className="flex flex-wrap items-center gap-4 mt-2">
                                     <Select onValueChange={setCurrentLanguage} value={currentLanguage}>
                                        <SelectTrigger className="flex-grow"><SelectValue placeholder="Select Language" /></SelectTrigger>
                                        <SelectContent>
                                            {languageList.map(lang => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="read" checked={canRead} onCheckedChange={(checked) => setCanRead(checked as boolean)} />
                                        <Label htmlFor="read">Read</Label>
                                    </div>
                                     <div className="flex items-center space-x-2">
                                        <Checkbox id="write" checked={canWrite} onCheckedChange={(checked) => setCanWrite(checked as boolean)} />
                                        <Label htmlFor="write">Write</Label>
                                    </div>
                                     <div className="flex items-center space-x-2">
                                        <Checkbox id="speak" checked={canSpeak} onCheckedChange={(checked) => setCanSpeak(checked as boolean)} />
                                        <Label htmlFor="speak">Speak</Label>
                                    </div>
                                    <Button type="button" onClick={handleAddLanguage} className="bg-yellow-500 hover:bg-yellow-600">Add</Button>
                                </div>
                            </div>
                        </div>
                         <div className="mt-6">
                            <h3 className="font-semibold mb-4">Added Languages</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Language</TableHead>
                                            <TableHead>Read</TableHead>
                                            <TableHead>Write</TableHead>
                                            <TableHead>Speak</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {languages.map((lang, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{lang.name}</TableCell>
                                                <TableCell>{lang.read ? 'Yes' : 'No'}</TableCell>
                                                <TableCell>{lang.write ? 'Yes' : 'No'}</TableCell>
                                                <TableCell>{lang.speak ? 'Yes' : 'No'}</TableCell>
                                                <TableCell>
                                                    <Button variant="destructive" size="icon" onClick={() => handleRemoveLanguage(index)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {languages.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center">No languages added yet.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </fieldset>
                    <StepButtons onReset={() => {
                        reset();
                        setLanguages([]);
                    }} onBack={onBack} />
                </form>
            </CardContent>
        </Card>
    );
}
