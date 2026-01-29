
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Image from 'next/image';

interface FileViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fileUrl: string;
}

export function FileViewModal({
  isOpen,
  onClose,
  title,
  fileUrl,
}: FileViewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0">
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
        <div className="p-6 flex justify-center items-center">
          {fileUrl && (
            <Image
              src={fileUrl}
              alt={title}
              width={500}
              height={500}
              className="max-w-full max-h-[70vh] object-contain"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
