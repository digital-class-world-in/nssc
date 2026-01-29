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
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  const [fileUrl, setFileUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Reset state when modal opens or closes
    if (!isOpen) {
      setSelectedFile(null);
      setFileName('');
      setFileUrl('');
    }
  }, [isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const minSize = 10 * 1024; // 10KB
      const maxSize = 150 * 1024; // 150KB

      if (file.size < minSize || file.size > maxSize) {
        toast({
          variant: 'destructive',
          title: 'Invalid File Size',
          description: `File size must be between 10KB and 150KB. Your file is ~${Math.round(
            file.size / 1024
          )}KB.`,
        });
        // Clear the input
        event.target.value = '';
        setSelectedFile(null);
        setFileName('');
        setFileUrl('');
        return;
      }

      setSelectedFile(file);
      setFileName(file.name);
      // Create a temporary URL for preview
      const url = URL.createObjectURL(file);
      setFileUrl(url);
    }
  };

  const handleUpload = () => {
    if (selectedFile && fileUrl) {
      // Pass the file name and URL back to the parent component
      onFileUpload({ name: selectedFile.name, url: fileUrl });
      onClose(); // Close modal after selection
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
            <p>File Types Allowed: .jpg, .jpeg</p>
            <p>File Size: 10KB to 150KB</p>
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
                accept=".jpg,.jpeg"
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
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
