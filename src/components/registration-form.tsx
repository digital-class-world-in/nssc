'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, Timestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import Script from 'next/script';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';


const formSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    middleName: z.string().optional(),
    lastName: z.string().min(1, 'Last name is required'),
    dob: z.date({ required_error: 'Date of birth is required.' }),
    gender: z.string().min(1, 'Gender is required'),
    email: z.string().email('Invalid email address'),
    primaryMobile: z.string().regex(/^\d{10}$/, 'Invalid mobile number'),
    secondaryMobile: z
      .string()
      .regex(/^\d{10}$/, 'Invalid mobile number')
      .optional()
      .or(z.literal('')),
    securityQuestion: z.string().min(1, 'Security question is required'),
    securityAnswer: z.string().min(1, 'Security answer is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(15, 'Password must be at most 15 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain an uppercase letter, a number, and a special character'
      ),
    confirmPassword: z.string(),
    captcha: z.string().min(1, 'Captcha is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export function RegistrationForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [captcha, setCaptcha] = useState<{
    num1: number;
    num2: number;
    answer: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  
  const { auth, firestore } = useFirebase();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      gender: '',
      email: '',
      primaryMobile: '',
      secondaryMobile: '',
      securityQuestion: '',
      securityAnswer: '',
      password: '',
      confirmPassword: '',
      captcha: '',
    },
  });

  useEffect(() => {
    // @ts-ignore
    window.phoneEmailReceiver = (userObj) => {
      fetch(`/api/verify-email?url=${encodeURIComponent(userObj.user_json_url)}`)
        .then(res => res.json())
        .then(data => {
          if (data.email) {
            form.setValue('email', data.email, { shouldValidate: true });
            setIsEmailVerified(true);
            toast({
              title: "Email Verified!",
              description: "Your email has been successfully verified.",
            });
          } else {
            throw new Error(data.error || 'Failed to fetch email.');
          }
        })
        .catch(err => {
          console.error("Verification failed:", err);
          toast({
            variant: 'destructive',
            title: "Verification Failed",
            description: err.message,
          });
        });
    };
  }, [form, toast]);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ num1: n1, num2: n2, answer: n1 + n2 });
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (captcha && parseInt(values.captcha) !== captcha.answer) {
      toast({
        variant: 'destructive',
        title: 'Invalid Captcha',
        description: 'Please solve the math problem correctly.',
      });
      generateCaptcha();
      form.setValue('captcha', '');
      return;
    }
    
    if (!isEmailVerified) {
        toast({
            variant: 'destructive',
            title: 'Email not verified',
            description: 'Please verify your email address before registering.',
        });
        return;
    }

    setIsSubmitting(true);
    if (!auth || !firestore) return;

    try {
      const usersRef = collection(firestore, 'users');
      
      const emailQuery = query(usersRef, where('email', '==', values.email));
      const emailQuerySnapshot = await getDocs(emailQuery);
      if (!emailQuerySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: 'This email address is already registered.',
        });
        setIsSubmitting(false);
        return;
      }
      
      const mobileQuery = query(usersRef, where('primaryMobile', '==', values.primaryMobile));
      const mobileQuerySnapshot = await getDocs(mobileQuery);
      if (!mobileQuerySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: 'This mobile number is already registered.',
        });
        setIsSubmitting(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;
      const profileId =
        new Date().getFullYear().toString() +
        Math.random().toString(36).substring(2, 10).toUpperCase();

      await updateProfile(user, {
        displayName: `${values.firstName} ${values.lastName}`,
      });

      const userRole = (values.email === 'nssc@gmail.com' || values.email === 'nssc13@gmail.com') ? 'admin' : 'candidate';
      
      const userDocRef = doc(firestore, 'users', user.uid);
      const userData = {
        profileId,
        firstName: values.firstName,
        middleName: values.middleName,
        lastName: values.lastName,
        dob: Timestamp.fromDate(values.dob),
        gender: values.gender,
        email: values.email,
        primaryMobile: values.primaryMobile,
        secondaryMobile: values.secondaryMobile,
        securityQuestion: values.securityQuestion,
        createdAt: Timestamp.now(),
        role: userRole,
        status: 'active',
      };

      setDoc(userDocRef, userData)
        .then(() => {
            router.push(`/registration-success?profileId=${profileId}&email=${encodeURIComponent(values.email)}`);
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'create',
                requestResourceData: userData,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
      
    } catch (error: any) {
      console.error('Registration Error:', error);
      let description = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'This email address is already in use by another account.';
      } else {
        description = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description,
      });
    } finally {
      // Don't set isSubmitting to false here, as we navigate away on success
      // and the component will unmount. If there's an error caught by the catch block,
      // we do want to re-enable the button.
       if(!isSubmitting) setIsSubmitting(false);
    }
  };

  return (
    <>
    <Script src="https://www.phone.email/verify_email_v1.js" strategy="lazyOnload" />
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="middleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Middle / Father Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter middle name" {...field} />
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
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                      captionLayout="dropdown-buttons"
                      fromYear={1950}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Verify Email</FormLabel>
                        <div className="flex items-center gap-2">
                            <FormControl>
                                <Input 
                                    placeholder="Enter email" 
                                    {...field} 
                                    readOnly={isEmailVerified}
                                    className="flex-grow"
                                />
                            </FormControl>
                            {isEmailVerified ? (
                                <div className="flex h-10 items-center gap-2 px-3 border rounded-md bg-green-50 text-green-700 shrink-0">
                                    <ShieldCheck className="h-5 w-5" />
                                    <span>Verified</span>
                                </div>
                            ) : (
                               <div className="shrink-0">
                                  <style>{`
                                    iframe#pe-widget-button-0 {
                                      padding: 15px !important;
                                    }
                                  `}</style>
                                  <div 
                                      className="pe_verify_email"
                                      data-client-id="16603997657861093734"
                                      data-login-text="Verify with Email"
                                      data-company-name="National Skill Sector Council"
                                  >
                                  </div>
                               </div>
                            )}
                        </div>
                         <FormMessage />
                    </FormItem>
                )}
            />
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="primaryMobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Mobile Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter mobile number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
          control={form.control}
          name="secondaryMobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secondary Mobile (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter secondary mobile number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="securityQuestion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Security Question</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a security question" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="birth-city">
                      What is your birth city?
                    </SelectItem>
                    <SelectItem value="pet-name">
                      What is your first pet's name?
                    </SelectItem>
                    <SelectItem value="mother-maiden-name">
                      What is your mother's maiden name?
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="securityAnswer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Security Answer</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your answer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="captcha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How much is the sum</FormLabel>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-muted rounded-md">
                  {captcha ? `${captcha.num1} + ${captcha.num2} = ?` : '...'}
                </span>
                <FormControl>
                  <Input
                    placeholder="Your answer"
                    {...field}
                    disabled={!captcha}
                    className="w-32"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting || !isEmailVerified}>
          {isSubmitting ? <Loader2 className='animate-spin' /> : 'Register'}
        </Button>
      </form>
    </Form>
    </>
  );
}
