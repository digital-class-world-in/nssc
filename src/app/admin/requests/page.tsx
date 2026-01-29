
'use client';

import { useMemo, useState, useEffect } from 'react';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, CheckCircle, XCircle, Clock, Loader2, Trash2, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCollection } from '@/firebase/firestore/use-collection';
import { initializeFirebase } from '@/firebase';
import { collection, doc, updateDoc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ViewDocumentsModal } from '@/components/admin/view-documents-modal';
import { Input } from '@/components/ui/input';

type Document = {
  id: string;
  label: string;
  url: string;
  name: string;
  status?: 'Verified' | 'Rejected' | 'Refill Required' | 'Pending';
  uploadedAt?: string;
};

type AppliedCourse = {
  id: string;
  applicationId: string;
  courseCategory: string;
  lastUpdated: string;
  amount: string;
  date: string;
  status: 'Pending' | 'Appointment Booked' | 'Verified' | 'Rejected' | 'Refill Required';
  appointmentDate?: string;
  documents?: Document[];
};

type User = {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    profileId?: string;
    photoUrl?: string;
    appliedCourses?: AppliedCourse[];
};

type RequestItem = {
    user: User;
    course: AppliedCourse;
}

const safeFormatDate = (dateString: string) => {
    try {
        // Handle ISO strings and "MM/DD/YYYY" or other common formats
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            // Try parsing MM/DD/YYYY manually for robustness
            const parts = dateString.split('/');
            if (parts.length === 3) {
                const [month, day, year] = parts;
                const parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
                if (!isNaN(parsedDate.getTime())) {
                    return format(parsedDate, 'dd-MMM-yyyy');
                }
            }
            return 'Invalid Date';
        }
        return format(date, 'dd-MMM-yyyy');
    } catch (error) {
        return 'Invalid Date';
    }
};


export default function RequestsPage() {
  const { firestore } = initializeFirebase();
  const { toast } = useToast();
  const usersQuery = useMemo(() => (firestore ? collection(firestore, 'users') : null), [firestore]);
  const { data: users, loading } = useCollection<User>(usersQuery);

  const [allRequests, setAllRequests] = useState<RequestItem[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RequestItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const [selectedCourseName, setSelectedCourseName] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    if (users) {
        const requests = users.flatMap(user => 
            (user.appliedCourses || []).map(course => ({ user, course }))
        );
        setAllRequests(requests);
    }
  }, [users]);
  
  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = allRequests.filter(({ user }) => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(lowercasedTerm) ||
        user.profileId?.toLowerCase().includes(lowercasedTerm)
    );
    setFilteredRequests(filtered);
  }, [searchTerm, allRequests]);

  const handleUpdateStatus = async (userId: string, courseId: string, newStatus: AppliedCourse['status']) => {
      if (!firestore) return;

      try {
          const userRef = doc(firestore, 'users', userId);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
              const userData = userSnap.data();
              const courses = userData.appliedCourses || [];
              const courseIndex = courses.findIndex((c: AppliedCourse) => c.id === courseId);

              if (courseIndex > -1) {
                  courses[courseIndex].status = newStatus;
                  await updateDoc(userRef, { appliedCourses: courses });
                  toast({
                      title: 'Status Updated',
                      description: `The request has been marked as "${newStatus}".`,
                  });
              }
          }
      } catch (error: any) {
          toast({
              variant: 'destructive',
              title: 'Update Failed',
              description: error.message,
          });
      }
  }

  const handleDeleteRequest = async (userId: string, courseId: string) => {
    if (!firestore) return;

    try {
        const userRef = doc(firestore, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            const updatedCourses = (userData.appliedCourses || []).filter((c: AppliedCourse) => c.id !== courseId);
            
            await updateDoc(userRef, { appliedCourses: updatedCourses });
            
            toast({
                title: 'Request Deleted',
                description: 'The application request has been successfully deleted.',
            });
        }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Deletion Failed',
            description: error.message,
        });
    }
  }

  const handleViewDocuments = (request: RequestItem) => {
      setSelectedDocuments(request.course.documents || []);
      setSelectedStudentName(`${request.user.firstName} ${request.user.lastName}`);
      setSelectedCourseName(request.course.courseCategory);
      setSelectedUserId(request.user.id);
      setSelectedCourseId(request.course.id);
      setIsModalOpen(true);
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Appointment Booked':
      case 'Verified':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Rejected':
      case 'Refill Required':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  
   const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Appointment Booked':
      case 'Verified':
        return <CheckCircle className="h-4 w-4" />;
      case 'Pending':
      case 'Refill Required':
        return <Clock className="h-4 w-4" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Requests Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Student Requests</CardTitle>
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
          ) : filteredRequests.length > 0 ? (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredRequests.map((request) => (
                    <TableRow key={request.course.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={request.user.photoUrl} />
                            <AvatarFallback>
                            {request.user.firstName?.charAt(0)}{request.user.lastName?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{request.user.firstName} {request.user.lastName}</p>
                            <p className="text-sm text-muted-foreground">
                            {request.user.profileId}
                            </p>
                        </div>
                        </div>
                    </TableCell>
                    <TableCell>{request.course.courseCategory}</TableCell>
                    <TableCell>{safeFormatDate(request.course.date)}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusVariant(request.course.status)} className="flex items-center gap-1.5">
                        {getStatusIcon(request.course.status)}
                        {request.course.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <AlertDialog>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewDocuments(request)}>
                                    <Eye className="mr-2 h-4 w-4" /> View Documents
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleUpdateStatus(request.user.id, request.course.id, 'Verified')}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleUpdateStatus(request.user.id, request.course.id, 'Rejected')}>
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(request.user.id, request.course.id, 'Refill Required')}>
                                <Clock className="mr-2 h-4 w-4" /> Mark as Refill Required
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this application request.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteRequest(request.user.id, request.course.id)} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          ) : (
             <div className="h-24 text-center flex items-center justify-center">
                No student requests found.
              </div>
          )}
        </CardContent>
      </Card>
    </div>
    {isModalOpen && selectedUserId && selectedCourseId && (
        <ViewDocumentsModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            documents={selectedDocuments}
            studentName={selectedStudentName}
            courseName={selectedCourseName}
            userId={selectedUserId}
            courseId={selectedCourseId}
        />
    )}
    </>
  );
}
