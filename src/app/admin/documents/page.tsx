
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, FileText, FileImage, Download, Edit, Trash2, Loader2, User, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

type StudentDocument = {
  id: string; // doc id from subcollection
  studentName: string;
  studentId: string;
  studentPhotoUrl: string;
  documentName: string; // e.g., "Aadhaar Card"
  fileName: string; // e.g., "aadhaar.jpg"
  documentUrl: string;
  uploadedOn: any;
};

const getFileIcon = (fileName: string) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'pdf':
            return <FileText className="h-5 w-5 text-red-500" />;
        case 'jpg':
        case 'png':
        case 'jpeg':
            return <FileImage className="h-5 w-5 text-blue-500" />;
        case 'docx':
            return <FileText className="h-5 w-5 text-blue-700" />;
        default:
            return <FileText className="h-5 w-5 text-gray-500" />;
    }
}

const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
        const d = date.toDate ? date.toDate() : new Date(date);
        return format(d, 'dd-MMM-yyyy');
    } catch {
        return 'Invalid Date';
    }
}

export default function DocumentsPage() {
  const { firestore } = initializeFirebase();
  const usersQuery = useMemo(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users, loading } = useCollection(usersQuery);

  const [allDocuments, setAllDocuments] = useState<StudentDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<StudentDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (users) {
      const documents: StudentDocument[] = [];
      users.forEach(user => {
        if (user.appliedCourses) {
          user.appliedCourses.forEach((course: any) => {
            if (course.documents) {
              course.documents.forEach((doc: any) => {
                documents.push({
                  id: `${user.id}-${course.id}-${doc.id}`,
                  studentName: [user.firstName, user.lastName].filter(Boolean).join(' '),
                  studentId: user.profileId,
                  studentPhotoUrl: user.photoUrl,
                  documentName: doc.label,
                  fileName: doc.name,
                  documentUrl: doc.url,
                  uploadedOn: course.lastUpdated ? new Date(course.lastUpdated) : new Date(),
                });
              });
            }
          });
        }
      });
      setAllDocuments(documents);
    }
  }, [users]);

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = allDocuments.filter(doc => 
        doc.studentName.toLowerCase().includes(lowercasedTerm) ||
        doc.documentName.toLowerCase().includes(lowercasedTerm) ||
        doc.fileName.toLowerCase().includes(lowercasedTerm)
    );
    setFilteredDocuments(filtered);
  }, [searchTerm, allDocuments]);


  const handleDownload = (url: string) => {
      window.open(url, '_blank');
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Student Documents
          </CardTitle>
          <div className="mt-4 flex items-center gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Filter by student or document name..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
          </div>
        </CardHeader>
        <CardContent>
            <div className="mt-4">
                {loading ? (
                    <div className="flex justify-center items-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : filteredDocuments.length > 0 ? (
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Document Type</TableHead>
                            <TableHead>File Name</TableHead>
                            <TableHead>Uploaded On</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredDocuments.map((doc) => (
                            <TableRow key={doc.id}>
                            <TableCell className="font-medium">
                               <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9">
                                    <AvatarImage src={doc.studentPhotoUrl} />
                                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{doc.studentName}</p>
                                    <p className="text-xs text-muted-foreground">{doc.studentId}</p>
                                  </div>
                                </div>
                            </TableCell>
                            <TableCell className="font-medium flex items-center gap-2">
                                {getFileIcon(doc.fileName)}
                                {doc.documentName}
                            </TableCell>
                            <TableCell>{doc.fileName}</TableCell>
                            <TableCell>{formatDate(doc.uploadedOn)}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleDownload(doc.documentUrl)}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center text-muted-foreground p-8">
                        No documents have been uploaded by any student yet.
                    </div>
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
