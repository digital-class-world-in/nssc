
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useUser } from '@/firebase';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onFileUpload: (file: { name: string; url: string }) => void;
}

export function FileUploadModal({
  isOpen,
  onClose,
  title,
  onFileUpload,
}: FileUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();
  const { storage } = useFirebase();
  const { user } = useUser();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Reset state when modal opens or closes
    if (!isOpen) {
      setSelectedFile(null);
      setFileName('');
      setIsUploading(false);
    }
  }, [isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const minSize = 10 * 1024; // 10KB
      const maxSize = 1 * 1024 * 1024; // 1MB

      if (file.size < minSize || file.size > maxSize) {
        toast({
          variant: 'destructive',
          title: 'Invalid File Size',
          description: `File size must be between 10KB and 1MB. Your file is ~${Math.round(
            file.size / 1024
          )}KB.`,
        });
        // Clear the input
        event.target.value = '';
        setSelectedFile(null);
        setFileName('');
        return;
      }

      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ variant: 'destructive', title: 'No file selected' });
      return;
    }
    if (!storage || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not connect to storage service. Please try again.',
      });
      return;
    }

    setIsUploading(true);

    const filePath = `user_uploads/${user.uid}/${Date.now()}_${
      selectedFile.name
    }`;
    const fileRef = storageRef(storage, filePath);

    try {
      const snapshot = await uploadBytes(fileRef, selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      onFileUpload({ name: selectedFile.name, url: downloadURL });

      toast({
        title: 'Upload Successful',
        description: 'Your file has been saved.',
      });
      onClose();
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description:
          error.message || 'An error occurred while uploading the file.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] p-0 font-ui">
        <DialogHeader className="p-4 bg-primary text-primary-foreground flex flex-row items-center justify-between">
          <DialogTitle>{title}</DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/80"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div className="text-sm">
            <p>File Types Allowed: .jpg, .jpeg, .png</p>
            <p>File Size: 10KB to 1MB</p>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file-upload">Select File to Upload *</Label>
            <div className="flex">
              <Label
                htmlFor="file-upload"
                className="cursor-pointer bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-l-md hover:bg-gray-300"
              >
                Choose File
              </Label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".jpg,.jpeg,.png"
              />
              <Input
                type="text"
                readOnly
                value={fileName}
                className="rounded-l-none"
                placeholder="photo.jpg"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="p-4 border-t gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isUploading}>
            Close
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
