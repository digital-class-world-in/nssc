
'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Upload, Trash2 } from 'lucide-react';
import { initializeFirebase } from '@/firebase';
import { collection, doc, getDoc, setDoc, Timestamp, addDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Image from 'next/image';

type PageDoc = {
  id: string;
  title: string;
  slug: string;
  content?: string;
  lastUpdated?: Timestamp;
  [key: string]: any;
};

type GalleryImage = {
  id: string;
  url: string;
  name: string;
  storagePath: string;
};

function PagesCmsContent() {
  const { firestore, storage } = initializeFirebase();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const pageId = searchParams.get('page');

  const [selectedPage, setSelectedPage] = useState<PageDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state for live editing
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  
  // Gallery specific state
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isGalleryPage = useMemo(() => slug === 'photo-gallery', [slug]);

  // Effect to fetch page data
  useEffect(() => {
    const fetchPage = async () => {
      if (pageId && firestore) {
        setLoading(true);
        const docRef = doc(firestore, 'website_pages', pageId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const pageData = { id: docSnap.id, ...docSnap.data() } as PageDoc;
          setSelectedPage(pageData);
          setTitle(pageData.title || '');
          setSlug(pageData.slug || '');
          setContent(pageData.content || '');
        } else {
          setSelectedPage(null);
          toast({ variant: 'destructive', title: 'Error', description: 'Page document not found in Firestore.' });
        }
        setLoading(false);
      } else {
        setSelectedPage(null);
        setLoading(false);
      }
    };

    fetchPage();
  }, [pageId, firestore, toast]);

  // Effect to listen for gallery images if it's the gallery page
  useEffect(() => {
    if (isGalleryPage && pageId && firestore) {
      const galleryCollectionRef = collection(firestore, 'website_pages', pageId, 'gallery_images');
      const unsubscribe = onSnapshot(galleryCollectionRef, (snapshot) => {
        const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage));
        setGalleryImages(images);
      });
      return () => unsubscribe();
    }
  }, [isGalleryPage, pageId, firestore]);
  
  const handleSaveChanges = async () => {
    if (!pageId || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'No page selected or database not available.' });
        return;
    }
    setSaving(true);
    try {
        const docRef = doc(firestore, 'website_pages', pageId);
        const dataToSave: Partial<PageDoc> = {
            title,
            slug,
            lastUpdated: Timestamp.now(),
        };

        // Only save content if it's not the gallery page
        if (!isGalleryPage) {
            dataToSave.content = content || '<p>No content available for this page.</p>';
        } else {
            // Save description for gallery page
            dataToSave.content = content;
        }

        await setDoc(docRef, dataToSave, { merge: true });

        setSelectedPage(prev => ({...prev!, ...dataToSave}));

        toast({ title: 'Success!', description: `Content for "${title}" has been saved.`});
    } catch (error: any) {
        console.error("Error saving content: ", error);
        toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
    } finally {
        setSaving(false);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile || !pageId || !storage || !firestore) return;
    setUploading(true);
    const storagePath = `gallery/${pageId}/${Date.now()}_${selectedFile.name}`;
    try {
      const storageRef = ref(storage, storagePath);
      const uploadResult = await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      const galleryCollectionRef = collection(firestore, 'website_pages', pageId, 'gallery_images');
      await addDoc(galleryCollectionRef, {
        url: downloadURL,
        name: selectedFile.name,
        storagePath: storagePath, // Save the path for deletion
        createdAt: Timestamp.now(),
      });

      toast({ title: 'Image Uploaded', description: `${selectedFile.name} has been added to the gallery.` });
      setSelectedFile(null);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async (image: GalleryImage) => {
    if (!pageId || !firestore || !storage) return;
    try {
      // 1. Delete from Firestore
      const imageDocRef = doc(firestore, 'website_pages', pageId, 'gallery_images', image.id);
      await deleteDoc(imageDocRef);

      // 2. Delete from Storage
      const imageStorageRef = ref(storage, image.storagePath);
      await deleteObject(imageStorageRef);

      toast({ title: 'Image Deleted', description: 'The image has been removed from the gallery.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Deletion Failed', description: error.message });
    }
  };


  const getFormattedDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return format(d, 'MMMM dd, yyyy');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!selectedPage) {
    return (
      <Card>
          <CardHeader><CardTitle>Select a Page</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground text-center p-8">Select a page from the sidebar menu to begin editing its content.</p></CardContent>
      </Card>
    );
  }
  
  const renderEditorContent = () => {
    if (isGalleryPage) {
      return (
        <div className='space-y-4'>
            <Label>Gallery Description</Label>
            <Textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder='Enter a description for the gallery...'
                rows={4}
            />
        </div>
      );
    }
    return (
        <div className="space-y-2">
            <Label htmlFor='page-content'>Page Content (HTML allowed)</Label>
            <Textarea 
                id='page-content'
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder='Enter the main content for this page...'
                rows={15}
            />
        </div>
    );
  }
  
  const renderGalleryManager = () => {
    if (!isGalleryPage) return null;
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gallery Image Manager</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Input id="gallery-file-input" type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
            <Label htmlFor="gallery-file-input" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer">
                Choose File
            </Label>
            {selectedFile && <span className="text-sm text-muted-foreground">{selectedFile.name}</span>}
            <Button onClick={handleImageUpload} disabled={uploading || !selectedFile}>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {galleryImages.map(image => (
              <div key={image.id} className="relative group aspect-square">
                <Image src={image.url} alt={image.name} fill className="object-cover rounded-md" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="destructive" size="icon" onClick={() => handleImageDelete(image)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
           {galleryImages.length === 0 && <p className="text-center text-muted-foreground p-4">No images uploaded yet.</p>}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>
              Editing: {selectedPage.title}
            </CardTitle>
            <Button onClick={handleSaveChanges} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              <span>{saving ? 'Saving...' : 'Save Content'}</span>
            </Button>
          </CardHeader>
          <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor='page-title'>Page Title</Label>
                    <Input id='page-title' value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor='page-slug'>Page Slug (URL)</Label>
                    <Input id='page-slug' value={slug} onChange={(e) => setSlug(e.target.value)} />
                  </div>
                </div>
                {renderEditorContent()}
              </div>
          </CardContent>
        </Card>
        
        {renderGalleryManager()}
    </div>
  );
}

export default function PagesCmsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <PagesCmsContent />
        </Suspense>
    )
}
