
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth, initializeFirebase, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from './use-toast';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';

export function useSessionTimeout() {
  const { auth, firestore } = initializeFirebase();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const [timeoutEnabled, setTimeoutEnabled] = useState(false);
  const [timeoutDuration, setTimeoutDuration] = useState(30 * 60 * 1000); // Default 30 mins
  
  const timeoutId = useRef<NodeJS.Timeout>();

  const logout = useCallback(() => {
    if (!auth) return;
    signOut(auth).then(() => {
      toast({
        variant: 'destructive',
        title: 'Session Expired',
        description: 'You have been logged out due to inactivity.',
      });
      router.push('/');
    });
  }, [auth, toast, router]);

  const resetTimer = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    if (timeoutEnabled && user) {
      timeoutId.current = setTimeout(logout, timeoutDuration);
    }
  }, [logout, timeoutDuration, timeoutEnabled, user]);

  useEffect(() => {
    const fetchSettings = async () => {
      if (firestore) {
        const settingsRef = doc(firestore, 'settings', 'global');
        const docSnap = await getDoc(settingsRef);
        if (docSnap.exists()) {
          const settings = docSnap.data();
          setTimeoutEnabled(settings.sessionTimeoutEnabled || false);
          if (settings.sessionTimeout) {
            setTimeoutDuration(settings.sessionTimeout * 60 * 1000);
          }
        }
      }
    };
    fetchSettings();
  }, [firestore]);
  

  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];

        const eventListener = () => resetTimer();

        events.forEach(event => window.addEventListener(event, eventListener));
        resetTimer();

        return () => {
            if (timeoutId.current) {
                clearTimeout(timeoutId.current);
            }
            events.forEach(event => window.removeEventListener(event, eventListener));
        };
    }
  }, [resetTimer, user]);

  return null;
}
