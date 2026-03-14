
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

type PageData = {
  id: string;
  title: string;
  content: string;
};

type GalleryImage = {
  id: string;
  url: string;
  name: string;
};

export default function PhotoGalleryPage() {
  const { firestore } = initializeFirebase();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPageData = async () => {
      if (!firestore) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const pagesRef = collection(firestore, 'website_pages');
        const q = query(pagesRef, where('slug', '==', 'photo-gallery'));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const page = { id: docSnap.id, ...docSnap.data() } as PageData;
          setPageData(page);

          // Now, set up a listener for the gallery images
          const galleryCollectionRef = collection(firestore, 'website_pages', page.id, 'gallery_images');
          const unsubscribe = onSnapshot(galleryCollectionRef, (snapshot) => {
            const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage));
            setGalleryImages(images);
            setLoading(false); // Set loading to false once images are fetched
          }, (err) => {
            console.error('Error fetching gallery images:', err);
            setError('Failed to load gallery images.');
            setLoading(false);
          });

          return () => unsubscribe();

        } else {
          setError('Photo Gallery page not found. Please create a page with the slug "photo-gallery" in the admin panel.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching page:', err);
        setError('Failed to load page content.');
        setLoading(false);
      }
    };

    fetchPageData();
  }, [firestore]);

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
          <CardTitle className="text-destructive">{error}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please check the console for more details or ensure the page is set up correctly in the admin panel.</p>
        </CardContent>
      </Card>
    );
  }

  if (!pageData) {
    return null;
  }

  return (
    <Card className="shadow-md font-ui">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary border-b-2 border-primary/20 pb-2">
          {pageData.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {pageData.content && (
            <div className="prose max-w-none">
                <p>{pageData.content}</p>
            </div>
        )}

        {galleryImages.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map(image => (
                    <div key={image.id} className="aspect-square relative rounded-lg overflow-hidden shadow-lg group">
                        <Image 
                            src={image.url}
                            alt={image.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                         <div className="absolute inset-0 bg-black/40 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white text-xs truncate">{image.name}</p>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <p>No images have been uploaded to this gallery yet.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
