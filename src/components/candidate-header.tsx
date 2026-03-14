
'use client';

import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, LogOut, Unlock } from 'lucide-react';
import { useUser, useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { NsscLogo } from './nssc-logo';
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const NavItem = ({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className="text-white hover:bg-secondary hover:text-white px-3 py-2 rounded-md text-sm font-bold uppercase flex items-center gap-1"
      >
        {label} {children && <ChevronDown className="h-4 w-4" />}
      </Button>
    </DropdownMenuTrigger>
    {children && <DropdownMenuContent>{children}</DropdownMenuContent>}
  </DropdownMenu>
);

export function CandidateHeader() {
  const { user } = useUser();
  const router = useRouter();
  const { auth, firestore } = useFirebase();
  const { toast } = useToast();
  const [isProfileLocked, setIsProfileLocked] = useState(false);

  useEffect(() => {
    if (user && firestore) {
      const fetchUserData = async () => {
        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIsProfileLocked(docSnap.data().profileLocked || false);
        }
      };
      fetchUserData();
    }
  }, [user, firestore]);

  const handleLogout = async () => {
    try {
      if (!auth) return;
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: error.message,
      });
    }
  };

  const handleUnlockProfile = async () => {
      if (user && firestore) {
        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            await setDoc(userDocRef, { profileLocked: false }, { merge: true });
            setIsProfileLocked(false);
            toast({
                title: 'Profile Unlocked',
                description: 'You can now edit your profile.',
            });
            router.push('/candidate/profile');
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Unlock Failed',
                description: 'Could not unlock your profile. Please try again.',
            });
        }
      }
  }

  const handlePrintProfile = () => {
      router.push('/candidate/print-profile');
  }

  return (
    <header className="shadow-md font-ui bg-card z-50">
        <div className="bg-primary border-t border-secondary">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                  <Link href="/">
                    <NsscLogo className="h-12 w-12" />
                  </Link>
                  <nav className="flex items-center space-x-1">
                    <Link
                      href="/candidate/dashboard"
                       className="text-primary-foreground px-3 py-2 rounded-md text-sm font-bold uppercase hover:bg-secondary transition-colors flex items-center gap-2"
                    >
                      Dashboard
                    </Link>
                    <NavItem label="Application Form">
                      {isProfileLocked ? (
                        <>
                          <DropdownMenuItem onSelect={handleUnlockProfile}>
                            <Unlock className="mr-2 h-4 w-4" />
                            Unlock Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={handlePrintProfile}>Print Profile Form</DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem onSelect={() => router.push('/candidate/profile?step=1')}>Primary Details</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => router.push('/candidate/profile?step=2')}>Address Details</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => router.push('/candidate/profile?step=3')}>Parent / Guardian Details</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => router.push('/candidate/profile?step=4')}>Category Details</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => router.push('/candidate/profile?step=5')}>Qualification Details</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => router.push('/candidate/profile?step=6')}>Training Details</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => router.push('/candidate/profile?step=7')}>Additional Details</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => router.push('/candidate/profile?step=8')}>Bank Details</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => router.push('/candidate/profile?step=9')}>Work Experience</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => router.push('/candidate/profile?step=10')}>Lock Profile</DropdownMenuItem>
                        </>
                      )}
                    </NavItem>
                    <Link
                      href="/candidate/apply"
                      className="text-primary-foreground px-3 py-2 rounded-md text-sm font-bold uppercase hover:bg-secondary transition-colors flex items-center gap-2"
                    >
                      Apply For Registration
                    </Link>
                    <NavItem label="Miscellaneous">
                        <DropdownMenuItem>Option 1</DropdownMenuItem>
                    </NavItem>
                    <NavItem label="Print Menu">
                        <DropdownMenuItem onSelect={handlePrintProfile}>Print Application Form</DropdownMenuItem>
                        <DropdownMenuItem>Print Payment Slip</DropdownMenuItem>
                    </NavItem>
                  </nav>

                  <div className="flex items-center gap-4">
                    {user && (
                      <span className="text-white text-sm hidden md:block">
                        Welcome, {user.displayName || user.email}
                      </span>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
              </div>
            </div>
        </div>
    </header>
  );
}
