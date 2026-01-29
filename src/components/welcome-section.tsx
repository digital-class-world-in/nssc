
"use client";

import React from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';

const administratorProfile = PlaceHolderImages.find(
  (img) => img.id === 'administrator-profile'
);
const registrarProfile = PlaceHolderImages.find(
  (img) => img.id === 'registrar-profile'
);

export function WelcomeSection() {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="font-headline text-2xl font-bold text-destructive/80 mb-2 border-b-2 border-primary/30 pb-2">
              Welcome to National Skills Sector Councils, New Delhi
            </h2>
            <p className="text-foreground/80 leading-relaxed font-body">
              The constitution of the National Skills Sector Councils is for the
              purpose of co-ordination and determination of standards of training and
              education in various skill sectors and to maintain a Register of registered 
              professionals in the State of Maharashtra.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-4">
            <div className="text-center">
              {administratorProfile && (
                 <div className="w-32 h-32 rounded-full mx-auto mb-3 border-4 border-gray-200 overflow-hidden flex items-center justify-center">
                    <div className="relative w-full h-full">
                        <Image
                            src={administratorProfile.imageUrl}
                            alt="Dr.krushana yadav"
                            data-ai-hint={administratorProfile.imageHint}
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
              )}
              <h3 className="font-bold font-ui text-lg text-primary underline">
                Dr.krushana yadav
              </h3>
              <p className="text-sm text-gray-600">Director</p>
            </div>
            <div className="text-center">
              {registrarProfile && (
                <div className="w-32 h-32 rounded-full mx-auto mb-3 border-4 border-gray-200 overflow-hidden flex items-center justify-center">
                    <div className="relative w-full h-full">
                        <Image
                            src={registrarProfile.imageUrl}
                            alt="Dr. Nill Ahuja"
                            data-ai-hint={registrarProfile.imageHint}
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
              )}
              <h3 className="font-bold font-ui text-lg text-primary underline">
                Dr. Nill Ahuja
              </h3>
              <p className="text-sm text-gray-600">Secretary</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
