
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
import { X, FileText, Download, Eye, Check, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useState } from 'react';
import { DocumentPreviewModal } from './document-preview-modal';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


type Document = {
  id: string;
  label: string;
  url: string;
  name: string;
  status?: 'Verified' | 'Rejected' | 'Refill Required' | 'Pending';
  uploadedAt?: string;
};

interface ViewDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  studentName?: string;
  courseName?: string;
  userId: string;
  courseId: string;
}

export function ViewDocumentsModal({ 
    isOpen, 
    onClose, 
    documents: initialDocuments, 
    studentName, 
    courseName,
    userId,
    courseId,
}: ViewDocumentsModalProps) {
  
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [previewingDoc, setPreviewingDoc] = useState<Document | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { firestore } = initializeFirebase();
  const { toast } = useToast();

  const handleUpdateDocumentStatus = async (documentId: string, newStatus: Document['status']) => {
    if (!firestore || !userId || !courseId) return;

    setUpdatingId(documentId);

    try {
        const userRef = doc(firestore, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            const courses = userData.appliedCourses || [];
            const courseIndex = courses.findIndex((c: any) => c.id === courseId);

            if (courseIndex > -1) {
                const docs = courses[courseIndex].documents || [];
                const docIndex = docs.findIndex((d: any) => d.id === documentId);

                if (docIndex > -1) {
                    docs[docIndex].status = newStatus;
                    courses[courseIndex].documents = docs;
                    await updateDoc(userRef, { appliedCourses: courses });
                    
                    // Update local state to reflect change immediately
                    setDocuments(docs);

                    toast({
                        title: 'Document Status Updated',
                        description: `Document has been marked as "${newStatus}".`,
                    });
                }
            }
        }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: error.message,
        });
    } finally {
        setUpdatingId(null);
    }
  }

  const getStatusVariant = (status?: Document['status']) => {
    switch (status) {
        case 'Verified': return 'default';
        case 'Rejected': return 'destructive';
        case 'Refill Required': return 'secondary';
        default: return 'outline';
    }
  }
  
  const getStatusIcon = (status?: Document['status']) => {
      switch(status) {
          case 'Verified': return <Check className="mr-1.5 h-3 w-3" />;
          case 'Rejected': return <X className="mr-1.5 h-3 w-3" />;
          case 'Refill Required': return <RefreshCw className="mr-1.5 h-3 w-3" />;
          default: return null;
      }
  }


  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="p-4 bg-slate-100 flex flex-row items-center justify-between">
          <DialogTitle className="flex flex-col">
            <span>View Uploaded Documents</span>
            <span className="text-sm font-normal text-muted-foreground">{studentName} - {courseName}</span>
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {documents && documents.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Document Type</TableHead>
                        <TableHead>Uploaded On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {documents.map((doc) => (
                        <TableRow key={doc.id}>
                            <TableCell className="font-medium">{doc.label}</TableCell>
                            <TableCell>{doc.uploadedAt ? format(new Date(doc.uploadedAt), 'dd-MMM-yyyy') : 'N/A'}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(doc.status)}>
                                    {getStatusIcon(doc.status)}
                                    {doc.status || 'Pending'}
                                </Badge>
                            </TableCell>
                            <TableCell className="flex justify-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => setPreviewingDoc(doc)}>
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View</span>
                                </Button>
                                <a href={doc.url} download={doc.name} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="icon">
                                        <Download className="h-4 w-4" />
                                        <span className="sr-only">Download</span>
                                    </Button>
                                </a>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-green-600 hover:text-green-700" 
                                    onClick={() => handleUpdateDocumentStatus(doc.id, 'Verified')}
                                    disabled={updatingId === doc.id}
                                >
                                    {updatingId === doc.id ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <Check className="mr-1 h-4 w-4"/>}
                                    Approve
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleUpdateDocumentStatus(doc.id, 'Rejected')}
                                    disabled={updatingId === doc.id}
                                >
                                    {updatingId === doc.id ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <X className="mr-1 h-4 w-4"/>}
                                    Reject
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-yellow-600 hover:text-yellow-700"
                                    onClick={() => handleUpdateDocumentStatus(doc.id, 'Refill Required')}
                                    disabled={updatingId === doc.id}
                                >
                                    {updatingId === doc.id ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-1 h-4 w-4"/>}
                                    Refill
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          ) : (
            <div className="text-center p-8 text-muted-foreground flex flex-col items-center gap-2">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <p>⚠️ No documents have been uploaded for this request.</p>
            </div>
          )}
        </div>
        <DialogFooter className="p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    {previewingDoc && (
        <DocumentPreviewModal
            isOpen={!!previewingDoc}
            onClose={() => setPreviewingDoc(null)}
            document={previewingDoc}
        />
    )}
    </>
  );
}
