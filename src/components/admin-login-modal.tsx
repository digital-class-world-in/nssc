
'use client';

import { useState, useEffect } from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Lock, X } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { doc, getDoc } from 'firebase/firestore';

function getFirebaseAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'The email address is not valid. Please enter a valid email.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please check your email and password or create the user in the Firebase console.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    default:
      return 'An unknown error occurred. Please try again.';
  }
}

export function AdminLoginModal({ forStaff = false }: { forStaff?: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captcha] = useState({ num1: 35, num2: 1, answer: 36 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { auth, firestore } = useFirebase();
  const router = useRouter();
  
  const title = forStaff ? "Staff Login" : "Admin Login";

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (parseInt(captchaAnswer) !== captcha.answer) {
      toast({
        variant: 'destructive',
        title: 'Invalid Captcha',
        description: 'Please solve the math problem correctly.',
      });
      return;
    }

    setIsSubmitting(true);
    if (!auth || !firestore) return;
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      if (userDoc.exists()) {
          const userData = userDoc.data();
          const userRole = userData.role;

          if (userRole === 'admin' || userRole === 'staff') {
              toast({
                title: 'Login Successful',
                description: 'Redirecting to admin panel...',
              });
              router.push('/admin/dashboard');
          } else {
              await auth.signOut();
              toast({
                  variant: 'destructive',
                  title: 'Access Denied',
                  description: `You are not authorized to access the admin panel.`
              });
          }
      } else {
          await auth.signOut();
          toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'User role not found.'
          });
      }
    } catch (error: any) {
      console.error(`${title} Error:`, error.code, error.message);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: getFirebaseAuthErrorMessage(error.code),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[520px] p-0 font-ui bg-white">
      <DialogHeader className="p-4 h-12 bg-primary text-primary-foreground flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          <DialogTitle>{title}</DialogTitle>
        </div>
        <DialogClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-primary/80"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogClose>
      </DialogHeader>
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1 text-sm text-gray-600">
            <p>Welcome to the {forStaff ? 'staff' : 'admin'} area. Please login to continue.</p>
            <p className="mt-2 text-xs">Only authorized personnel are allowed.</p>
          </div>
          <div className="col-span-2">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="admin-email">Email ID</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="Enter Email ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10"
                  required
                />
              </div>
              <div>
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10"
                  required
                />
              </div>
              <div>
                <Label htmlFor="admin-captcha">How much is the sum</Label>
                <div className="flex items-center gap-2">
                    <span className="p-2 bg-blue-100 rounded-md">{`${captcha.num1} + ${captcha.num2} = ?`}</span>
                    <Input
                      id="admin-captcha"
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      placeholder="Your answer"
                      required
                      className="w-32 h-10"
                    />
                </div>
              </div>
              <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                      <Checkbox id="remember-me" />
                      <Label htmlFor="remember-me" className="text-sm font-normal">Remember me</Label>
                  </div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full h-[46px] bg-destructive hover:bg-destructive/90 text-lg">
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </div>
        </div>
      </div>
       <DialogFooter className="p-4 border-t flex justify-between">
          <Button variant="link" className="text-sm p-0 h-auto">Forgot password?</Button>
          <DialogClose asChild>
            <Button variant="link" className="text-sm p-0 h-auto">Close</Button>
          </DialogClose>
        </DialogFooter>
    </DialogContent>
  );
}
