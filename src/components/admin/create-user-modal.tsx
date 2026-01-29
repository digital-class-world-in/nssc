
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { initializeFirebase } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { UserPlus, X, Loader2 } from 'lucide-react';
import { Switch } from '../ui/switch';


const permissionsSchema = z.object({
  dashboard: z.boolean().default(false),
  requests: z.boolean().default(false),
  pages: z.boolean().default(false),
  students: z.boolean().default(false),
  staff: z.boolean().default(false),
  documents: z.boolean().default(false),
  forms: z.boolean().default(false),
  'users-roles': z.boolean().default(false),
  settings: z.boolean().default(false),
  'audit-logs': z.boolean().default(false),
});

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  role: z.enum(['admin', 'staff', 'candidate']),
  status: z.enum(['active', 'inactive']),
  permissions: permissionsSchema.optional(),
});

const permissionLabels: { [key in keyof z.infer<typeof permissionsSchema>]: string } = {
  dashboard: 'Dashboard',
  requests: 'Requests',
  pages: 'Pages / LMS',
  students: 'Students',
  staff: 'Staff',
  documents: 'Documents & Downloads',
  forms: 'Forms & Submissions',
  'users-roles': 'Users & Roles',
  settings: 'Settings / Theme',
  'audit-logs': 'Audit Logs',
};

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'admin' | 'staff' | 'candidate';
  editingUser?: any;
}

export function CreateUserModal({ isOpen, onClose, defaultRole = 'candidate', editingUser }: CreateUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { auth, firestore } = initializeFirebase();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: defaultRole,
      status: 'active',
      permissions: {
        dashboard: true,
      }
    },
  });

  useEffect(() => {
    if (editingUser) {
      form.reset({
        firstName: editingUser.firstName || '',
        lastName: editingUser.lastName || '',
        email: editingUser.email || '',
        password: '', // Always initialize password field
        role: editingUser.role || defaultRole,
        status: editingUser.status || 'active',
        permissions: editingUser.permissions || { dashboard: true },
      });
    } else {
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: defaultRole,
        status: 'active',
        permissions: { dashboard: true },
      });
    }
  }, [editingUser, form, defaultRole]);
  
  const role = form.watch('role');

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        // Update existing user in Firestore
        const userRef = doc(firestore, 'users', editingUser.id);
        const dataToUpdate: any = {
          firstName: values.firstName,
          lastName: values.lastName,
          role: values.role,
          status: values.status,
        };
        if (values.role === 'staff') {
            dataToUpdate.permissions = values.permissions;
        }
        await updateDoc(userRef, dataToUpdate);

        toast({
          title: 'User Updated',
          description: `User ${values.email} has been successfully updated.`,
        });

      } else {
        if (!values.password) {
          form.setError('password', { message: 'Password is required for new users.' });
          setIsSubmitting(false);
          return;
        }
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        const user = userCredential.user;

        const profileId =
          new Date().getFullYear().toString() +
          Math.random().toString(36).substring(2, 10).toUpperCase();

        const dataToSave: any = {
            profileId,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            role: values.role,
            status: values.status,
            createdAt: Timestamp.now(),
        };

        if (values.role === 'staff') {
            dataToSave.permissions = values.permissions;
        }

        // Create user document in Firestore
        await setDoc(doc(firestore, 'users', user.uid), dataToSave);

        toast({
          title: 'User Created',
          description: `User ${values.email} has been successfully created.`,
        });
      }
      
      form.reset();
      onClose();
    } catch (error: any) {
      console.error('Error creating/updating user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0">
        <DialogHeader className="p-4 bg-primary text-primary-foreground flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus />
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="hover:bg-primary/80">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} disabled={!!editingUser} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!editingUser && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="candidate">Candidate</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex items-center space-x-4 pt-2"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="active" id="active" />
                            </FormControl>
                            <Label htmlFor="active">Active</Label>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="inactive" id="inactive" />
                            </FormControl>
                            <Label htmlFor="inactive">Inactive</Label>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               {role === 'staff' && (
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-2">Staff Permissions</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {Object.keys(permissionLabels).map((key) => (
                      <FormField
                        key={key}
                        control={form.control}
                        name={`permissions.${key as keyof z.infer<typeof permissionsSchema>}`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <FormLabel className="text-sm font-normal">
                              {permissionLabels[key as keyof typeof permissionLabels]}
                            </FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="p-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onClose()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Saving...' : (editingUser ? 'Save Changes' : 'Create User')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
