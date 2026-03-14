
'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  Query,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';

export function useCollection<T extends DocumentData>(
  query: Query<T> | null
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (query === null) {
      setData([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (querySnapshot) => {
        const fetchedData: T[] = [];
        querySnapshot.forEach((doc) => {
            fetchedData.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(fetchedData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore error in useCollection:", err);
        setError(err);
        setData(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
