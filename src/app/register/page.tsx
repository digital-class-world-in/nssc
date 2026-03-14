
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RegistrationForm } from '@/components/registration-form';
import { UserPlus } from 'lucide-react';


export default function RegisterPage() {
    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader className="bg-primary text-primary-foreground">
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus /> New Candidate Registration
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <RegistrationForm />
                </CardContent>
            </Card>
        </div>
    );
}
