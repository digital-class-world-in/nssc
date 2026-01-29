
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { initializeFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
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
import { MoreHorizontal, Trash2, KeyRound, User, Loader2, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { StudentProfileModal } from '@/components/admin/student-profile-modal';
import { Input } from '@/components/ui/input';

export default function StudentsPage() {
  const { firestore } = initializeFirebase();
  const { toast } = useToast();

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const studentsQuery = useMemo(
    () => (firestore ? collection(firestore, 'users') : null),
    [firestore]
  );
  const { data: students, loading } = useCollection(studentsQuery);

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    const lowercasedTerm = searchTerm.toLowerCase();
    return students.filter(student => 
      (student.profileId?.toLowerCase().includes(lowercasedTerm)) ||
      (`${student.firstName} ${student.lastName}`.toLowerCase().includes(lowercasedTerm)) ||
      (student.email.toLowerCase().includes(lowercasedTerm))
    );
  }, [students, searchTerm]);

  const handleDeleteStudent = async (studentId: string) => {
    if (!firestore) return;
    try {
        await deleteDoc(doc(firestore, 'users', studentId));
        toast({
            title: 'Student Deleted',
            description: 'The student record has been successfully deleted.',
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error Deleting Student',
            description: error.message,
        });
    }
  };
  
  const handleViewProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsProfileModalOpen(true);
  }

  const getStatusVariant = (status: string) => {
      switch (status) {
          case 'active':
              return 'default';
          case 'inactive':
              return 'secondary';
          case 'graduated':
              return 'outline';
          default:
              return 'secondary';
      }
  }

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <Card>
          <CardHeader>
            <CardTitle>All Students</CardTitle>
             <div className="mt-4 flex items-center gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Filter by name, ID, or email..." 
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
            ) : !filteredStudents || filteredStudents.length === 0 ? (
              <p className="text-center text-muted-foreground p-8">No students found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.profileId}
                      </TableCell>
                      <TableCell>{[student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ')}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.primaryMobile}</TableCell>
                      <TableCell>
                          <Badge variant={getStatusVariant(student.status)}>
                              {student.status || 'active'}
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
                              <DropdownMenuItem onSelect={() => handleViewProfile(student.id)}>
                                  <User className="mr-2 h-4 w-4" />
                                  View Profile
                              </DropdownMenuItem>
                              <AlertDialogTrigger asChild>
                                  <DropdownMenuItem>
                                      <KeyRound className="mr-2 h-4 w-4" />
                                      Get Credentials
                                  </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <DropdownMenuSeparator />
                              <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Student
                                  </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* Alert Dialog for Deletion */}
                          <AlertDialogContent>
                              <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the student's account
                                  and remove their data from our servers.
                              </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteStudent(student.id)} className="bg-destructive hover:bg-destructive/90">
                                  Delete
                              </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>

                          {/* Alert Dialog for Credentials */}
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2"><KeyRound/>Student Credentials</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      Below are the login details for the student. Passwords are encrypted and cannot be shown.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                               <div className="text-sm space-y-2">
                                  <div>
                                      <p className="font-semibold">Student ID:</p>
                                      <p className="font-mono bg-muted p-2 rounded-md">{student.profileId}</p>
                                  </div>
                                   <div>
                                      <p className="font-semibold">Password:</p>
                                      <p className="font-mono bg-muted p-2 rounded-md">******** (Encrypted)</p>
                                  </div>
                               </div>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Close</AlertDialogCancel>
                              </AlertDialogFooter>
                          </AlertDialogContent>

                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
