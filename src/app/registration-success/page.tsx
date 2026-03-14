'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

function RegistrationSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get('profileId');
  const email = searchParams.get('email');

  const handleProceedToLogin = () => {
    if (email) {
      router.push(`/?email=${encodeURIComponent(email)}`);
    } else {
      router.push('/');
    }
  };

  if (!profileId) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Profile ID not found. Please try registering again.</p>
          <Button onClick={() => router.push('/register')} className="mt-4">
            Go to Registration
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-sm font-ui">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2 text-primary border-b pb-2">
          <Info size={20} />
          User Login Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <ol className="list-decimal list-inside space-y-3">
          <li>
            Your Profile ID is{' '}
            <strong className="text-destructive font-bold">{profileId}</strong>.
            This Profile ID shall be used as User Name to login to your
            account.
          </li>
          <li>
            All Information and OTP (One Time Password) shall be sent through
            SMS on "Primary Mobile Number" hence "Primary Mobile Number" should
            be updated.
          </li>
          <li>Login to account and complete your Profile.</li>
        </ol>
        <div className="flex justify-center">
          <Button
            onClick={handleProceedToLogin}
            className="bg-[#D9534F] hover:bg-[#C9302C] text-white font-bold"
          >
            Proceed to Login &gt;&gt;&gt;
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


export default function RegistrationSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegistrationSuccessContent />
        </Suspense>
    )
}
