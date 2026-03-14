
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type PageData = {
  title: string;
  content: string;
  lastUpdated: Timestamp;
};

export default function DynamicPage() {
  const { slug } = useParams();
  const { firestore } = initializeFirebase();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPageData = async () => {
      if (!firestore || !slug) {
        setLoading(false);
        return;
      }

      try {
        const pagesRef = collection(firestore, 'website_pages');
        const q = query(pagesRef, where('slug', '==', slug as string));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Assuming slug is unique, take the first result
          const docSnap = querySnapshot.docs[0];
          setPageData(docSnap.data() as PageData);
        } else {
          setError('Page not found.');
        }
      } catch (err) {
        console.error('Error fetching page:', err);
        setError('Failed to load page content.');
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [firestore, slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!pageData) {
    return null;
  }

  const getFormattedDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return format(d, 'MMMM dd, yyyy');
  };

  return (
    <Card className="shadow-md font-ui">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary border-b-2 border-primary/20 pb-2">
          {pageData.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="prose max-w-none pt-6">
        <div dangerouslySetInnerHTML={{ __html: pageData.content || '<p>No content available for this page.</p>' }} />
        <p className="text-xs text-muted-foreground mt-8">
          Last Updated: {getFormattedDate(pageData.lastUpdated)}
        </p>
      </CardContent>
    </Card>
  );
}
