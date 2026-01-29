
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { initializeFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, CheckCircle, XCircle, Printer, Download, Trash2, Loader2, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { StudentProfileModal } from '@/components/admin/student-profile-modal';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

export default function FormsPage() {
  const { firestore } = initializeFirebase();
  const { toast } = useToast();

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const submissionsQuery = useMemo(
    () => (firestore ? collection(firestore, 'users') : null),
    [firestore]
  );
  const { data: submissions, loading } = useCollection(submissionsQuery);

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    
    // Filter out submissions that don't have courses first
    const submissionsWithCourses = submissions.filter(s => s.appliedCourses && s.appliedCourses.length > 0);

    if (!searchTerm) {
        return submissionsWithCourses;
    }

    const lowercasedTerm = searchTerm.toLowerCase();
    return submissionsWithCourses.filter(submission =>
        (`${submission.firstName} ${submission.lastName}`.toLowerCase().includes(lowercasedTerm)) ||
        (submission.profileId?.toLowerCase().includes(lowercasedTerm))
    );
  }, [submissions, searchTerm]);


  const handleUpdateStatus = async (submissionId: string, status: 'approved' | 'rejected') => {
    if (!firestore) return;
    try {
        const submissionRef = doc(firestore, 'users', submissionId);
        await updateDoc(submissionRef, { status });
        toast({
            title: `Submission ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            description: `The submission has been successfully ${status}.`,
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error Updating Status',
            description: error.message,
        });
    }
  };
  
  const handleDownloadDocs = (submission: any) => {
    // This is a placeholder. In a real scenario, you'd loop through an `attachments` array.
    if (submission.photoUrl) {
        window.open(submission.photoUrl, '_blank');
    } else {
        toast({
            variant: 'destructive',
            title: 'No Documents Found',
            description: 'This submission does not have any downloadable documents.',
        });
    }
  };

  const handleViewProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsProfileModalOpen(true);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default'; // Greenish in default theme
      case 'pending':
        return 'secondary'; // Grayish
      case 'rejected':
        return 'destructive'; // Red
      default:
        return 'outline';
    }
  };

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Forms & Submissions</h1>
        <Card>
          <CardHeader>
            <CardTitle>All Submissions</CardTitle>
            <div className="mt-4 flex items-center gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Filter by name or ID..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredSubmissions && filteredSubmissions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Form Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={submission.photoUrl} alt="Student photo" />
                                <AvatarFallback>{submission.firstName?.charAt(0)}{submission.lastName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{[submission.firstName, submission.lastName].filter(Boolean).join(' ')}</p>
                                <p className="text-sm text-muted-foreground">{submission.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{submission.profileId}</TableCell>
                        <TableCell>Registration</TableCell> {/* Placeholder */}
                        <TableCell>
                          <Badge variant={getStatusVariant(submission.status || 'pending')}>
                            {submission.status || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {submission.createdAt ? format(submission.createdAt.toDate(), 'dd-MMM-yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onSelect={() => handleViewProfile(submission.id)}>
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleUpdateStatus(submission.id, 'approved')}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleUpdateStatus(submission.id, 'rejected')}>
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                  <Printer className="mr-2 h-4 w-4" /> Print
                              </DropdownMenuItem>
                               <DropdownMenuItem onSelect={() => handleDownloadDocs(submission)}>
                                  <Download className="mr-2 h-4 w-4" /> Download Docs
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : (
              <div className="h-24 text-center flex items-center justify-center">
                No submissions found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {isProfileModalOpen && selectedStudentId && (
        <StudentProfileModal
          studentId={selectedStudentId}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </>
  );
}
