
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, setDoc, Timestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { format } from 'date-fns';
import { Loader2, Trash2, Plus } from 'lucide-react';

export default function AppointmentsPage() {
    const { firestore } = initializeFirebase();
    const { toast } = useToast();

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [slots, setSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [newSlot, setNewSlot] = useState('');

    const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

    useEffect(() => {
        if (!selectedDate || !firestore) return;

        const fetchSlots = async () => {
            setLoading(true);
            const docRef = doc(firestore, 'appointment_slots', formattedDate);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setSlots(docSnap.data().slots || []);
            } else {
                setSlots([]);
            }
            setLoading(false);
        };

        fetchSlots();

    }, [selectedDate, firestore, formattedDate]);

    const handleAddSlot = async () => {
        if (!newSlot.trim() || !selectedDate) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter a time slot.' });
            return;
        }

        const docRef = doc(firestore, 'appointment_slots', formattedDate);
        try {
            await setDoc(docRef, {
                date: Timestamp.fromDate(selectedDate),
                slots: arrayUnion(newSlot)
            }, { merge: true });
            
            setSlots(prev => [...prev, newSlot].sort());
            setNewSlot('');
            toast({ title: 'Success', description: 'New slot added.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };

    const handleDeleteSlot = async (slotToDelete: string) => {
         if (!selectedDate) return;
        const docRef = doc(firestore, 'appointment_slots', formattedDate);
        try {
            await setDoc(docRef, {
                slots: arrayRemove(slotToDelete)
            }, { merge: true });

            setSlots(prev => prev.filter(s => s !== slotToDelete));
            toast({ title: 'Success', description: 'Slot deleted.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Manage Appointment Slots</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                     <Card>
                        <CardHeader><CardTitle>Select a Date</CardTitle></CardHeader>
                        <CardContent>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="rounded-md border p-0"
                                disabled={(date) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return date < today;
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Available Slots for {selectedDate ? format(selectedDate, 'PPP') : '...'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 mb-4">
                                <Input
                                    placeholder="e.g., 10:00 AM - 11:00 AM"
                                    value={newSlot}
                                    onChange={(e) => setNewSlot(e.target.value)}
                                    onKeyUp={(e) => e.key === 'Enter' && handleAddSlot()}
                                />
                                <Button onClick={handleAddSlot}><Plus className="mr-2 h-4 w-4" /> Add Slot</Button>
                            </div>
                            
                            {loading ? (
                                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                            ) : slots.length > 0 ? (
                                <ul className="space-y-2">
                                    {slots.map((slot) => (
                                        <li key={slot} className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
                                            <span>{slot}</span>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSlot(slot)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-muted-foreground p-8">No slots defined for this date.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
