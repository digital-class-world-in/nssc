
'use client';
import { useUser, initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { DashboardStepper } from '@/components/dashboard-stepper';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-primary/10 rounded-lg flex items-center">
    <div className="bg-primary/20 text-primary-foreground font-semibold p-2 rounded-l-lg w-1/3 text-center">
      {label}
    </div>
    <div className="p-2 text-sm text-foreground w-2/3">{value}</div>
  </div>
);


export default function CandidateDashboardPage() {
  const { user, loading: userLoading } = useUser();
  const { firestore } = initializeFirebase();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user && firestore) {
      const fetchUserData = async () => {
        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          // If no user data, maybe they haven't completed profile
          router.push('/candidate/profile');
        }
        setLoading(false);
      };

      fetchUserData();
    }
  }, [user, firestore, router]);

  if (userLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  if (!userData) {
    return (
       <div className="flex h-screen items-center justify-center">
        <p>No user data found. Redirecting...</p>
      </div>
    )
  }

  const fullName = [userData.firstName, userData.middleName, userData.lastName].filter(Boolean).join(' ');

  const now = new Date();
  const loginTime = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric'}) + ' ' + now.toLocaleTimeString('en-US');
  const previousLoginTime = userData.lastLogin ? new Date(userData.lastLogin.seconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric'}) + ' ' + new Date(userData.lastLogin.seconds * 1000).toLocaleTimeString('en-US') : 'N/A';

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 font-ui space-y-6">
      <div className="bg-gray-700 text-white text-center p-2 rounded-lg">
          <h2 className="font-bold">Welcome to National Skills Sector Councils</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem label="User Login ID" value={userData.profileId} />
        <InfoItem label="IP Address" value="103.161.98.238/Chrome/Windows 10/N" />
        <InfoItem label="User Type" value="Candidate" />
        <InfoItem label="Current Login Time" value={loginTime} />
        <InfoItem label="User Name" value={fullName.toUpperCase()} />
        <InfoItem label="Previous Login Time" value={previousLoginTime} />
      </div>
      
      <Card>
          <CardHeader className="text-center bg-gray-700 text-white p-2 rounded-t-lg">
            <CardTitle className="text-lg">Candidate Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <DashboardStepper profileCompletion={userData.profileCompletion || 0} />
            <div className="mt-8 flex justify-center">
              <Button asChild size="lg" className="bg-destructive hover:bg-destructive/90 text-lg font-bold">
                  <Link href="/candidate/apply">
                      Apply For Registration
                      <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
              </Button>
            </div>
          </CardContent>
      </Card>

    </div>
  );
}
