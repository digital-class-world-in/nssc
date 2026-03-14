
'use client';
import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // In a development environment, we can throw the error to have it
      // picked up by the Next.js error overlay.
      if (process.env.NODE_ENV === 'development') {
        console.error("Caught a Firestore permission error:", error.message);
        // We throw the error to make it visible in the Next.js development overlay
        throw error;
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null; // This component does not render anything
}
