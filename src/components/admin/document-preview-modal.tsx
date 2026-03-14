
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
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

type Document = {
  label: string;
  url: string;
  name: string;
};

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

export function DocumentPreviewModal({ isOpen, onClose, document }: DocumentPreviewModalProps) {
  const [scale, setScale] = useState(1);

  if (!document) return null;

  const isPdf = document.name.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif)$/i.test(document.name);

  const handleDownload = () => {
    window.open(document.url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 h-[90vh]">
        <DialogHeader className="p-4 bg-slate-100 flex flex-row items-center justify-between">
          <DialogTitle>{document.label}</DialogTitle>
          <div className="flex items-center gap-2">
            {isImage && (
                 <>
                    <Button variant="ghost" size="icon" onClick={() => setScale(s => s * 1.2)}><ZoomIn/></Button>
                    <Button variant="ghost" size="icon" onClick={() => setScale(s => s / 1.2)}><ZoomOut/></Button>
                 </>
            )}
             <Button variant="ghost" size="icon" onClick={handleDownload}><Download/></Button>
            <DialogClose asChild>
                <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
                </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        <div className="h-full flex-1 p-4 overflow-auto flex items-center justify-center">
          {isImage ? (
            <div className="relative w-full h-full">
                 <Image 
                    src={document.url} 
                    alt={document.name} 
                    fill
                    className="object-contain"
                    style={{ transform: `scale(${scale})`, transition: 'transform 0.2s' }}
                />
            </div>
          ) : isPdf ? (
            <iframe src={document.url} className="w-full h-full border-0" title={document.name} />
          ) : (
            <div className="text-center">
              <p>Cannot preview this file type.</p>
              <Button onClick={handleDownload} className="mt-4">Download to view</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
