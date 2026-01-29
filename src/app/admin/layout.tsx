
'use client';

import { AdminLayout as AdminLayoutComponent } from '@/components/admin/admin-layout';
import { useSessionTimeout } from '@/hooks/use-session-timeout';
import { useEffect, useState } from 'react';
import { useUser, useFirebase } from '@/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { themes } from '@/lib/themes';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useSessionTimeout();
  const { user, loading: userLoading } = useUser();
  const { firestore } = useFirebase();
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');

  useEffect(() => {
    const applyPersistedAppearance = async () => {
      if (!firestore) return;
      try {
        const settingsRef = doc(firestore, 'settings', 'global');
        const docSnap = await getDoc(settingsRef);
        const root = document.documentElement;
        if (docSnap.exists()) {
          const settings = docSnap.data();
          const activeTheme = themes.find(t => t.name === settings.activeThemeName) || themes[0];
          Object.entries(activeTheme.cssVariables).forEach(([key, value]) => {
            root.style.setProperty(key, value as string);
          });
          const activeFont = settings.activeFont || 'var(--font-montserrat)';
          root.style.setProperty('--font-body', activeFont);
          root.style.setProperty('--font-ui', activeFont);
          const navbarTheme = themes.find(t => t.name === settings.navbarThemeName) || activeTheme;
          root.style.setProperty('--navbar-primary', navbarTheme.cssVariables['--primary']);
          root.style.setProperty('--navbar-secondary', navbarTheme.cssVariables['--secondary']);
        }
      } catch (error) {
        console.error("Error applying appearance settings:", error);
      }
    };
    applyPersistedAppearance();
  }, [firestore]);

  useEffect(() => {
    if (userLoading) {
      setAuthStatus('loading');
      return;
    }

    if (!user) {
      setAuthStatus('unauthorized');
      return;
    }

    if (!firestore) {
      setAuthStatus('loading');
      return;
    }
    
    const userDocRef = doc(firestore, 'users', user.uid);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.role === 'admin' || userData.role === 'staff') {
                setAuthStatus('authorized');
            } else {
                setAuthStatus('unauthorized');
            }
        } else {
            // The document might not be created yet, so we wait.
            // If it never gets created with the right role, this will effectively deny access.
            // We set it to loading initially to give login logic a chance to run.
             console.warn(`User document for ${user.uid} not found yet. Waiting...`);
        }
    }, (error) => {
        console.error("Error subscribing to user role:", error);
        setAuthStatus('unauthorized');
    });

    // Timeout to prevent being stuck in loading state if doc is never created
    const timeoutId = setTimeout(() => {
      if (authStatus === 'loading') {
        setAuthStatus('unauthorized');
      }
    }, 5000); // 5-second timeout

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
    
  }, [user, userLoading, firestore, authStatus]);


  if (authStatus === 'unauthorized') {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-sm">
                <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
                <p className="text-muted-foreground">You are not authorized to access this page.</p>
                <Button onClick={() => router.push('/')} className="mt-4">Go to Homepage</Button>
            </div>
        </div>
    );
  }

  if (authStatus === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <AdminLayoutComponent>{children}</AdminLayoutComponent>;
}
