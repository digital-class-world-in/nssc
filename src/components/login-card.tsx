
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "firebase/auth";
import { useUser, useFirebase } from "@/firebase";
import { useSearchParams, useRouter } from "next/navigation";
import { Dialog, DialogTrigger } from "./ui/dialog";
import { SignupModal } from "./signup-modal";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

function getFirebaseAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'The email address is not valid. Please enter a valid email.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please check your email and password.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    default:
      return 'An unknown error occurred. Please try again.';
  }
}


function LoginCardComponent() {
  const { toast } = useToast();
  const { user, loading } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { auth, firestore } = useFirebase();

  useEffect(() => {
    const registeredEmail = searchParams.get('email');
    if (registeredEmail) {
      setEmail(registeredEmail);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!auth || !firestore) {
        toast({
            variant: "destructive",
            title: "Firebase not initialized",
            description: "Please try again in a moment.",
        });
        setIsSubmitting(false);
        return;
    }
    
    try {
      let userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const loggedInUser = userCredential.user;
      const userDocRef = doc(firestore, "users", loggedInUser.uid);

      let userRole = 'candidate';
      if (email === 'nssc@gmail.com') {
          userRole = 'admin';
      } else {
        const userDoc = await getDoc(userDocRef);
         if (userDoc.exists()) {
            userRole = userDoc.data().role || 'candidate';
        }
      }

      await setDoc(userDocRef, { 
        lastLogin: Timestamp.now(),
        role: userRole,
        email: loggedInUser.email!,
      }, { merge: true });

      toast({
        title: "Login Successful",
        description: "Redirecting...",
      });
      
      if (userRole === 'admin' || userRole === 'staff') {
        router.push('/admin/dashboard');
      } else {
        router.push('/candidate/dashboard');
      }

    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
             if (email === 'nssc@gmail.com') {
                // Admin user doesn't exist, so create it
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const loggedInUser = userCredential.user;
                    const userDocRef = doc(firestore, "users", loggedInUser.uid);
                    await setDoc(userDocRef, {
                        role: 'admin',
                        email: loggedInUser.email,
                        lastLogin: Timestamp.now(),
                        createdAt: Timestamp.now(),
                        firstName: 'Admin',
                        lastName: 'User',
                    }, { merge: true });

                    toast({
                        title: "Admin Account Created & Logged In",
                        description: "Redirecting to admin panel...",
                    });
                    router.push('/admin/dashboard');
                    return; // Exit after successful creation and redirect

                } catch (creationError: any) {
                     toast({
                        variant: "destructive",
                        title: "Admin Creation Failed",
                        description: getFirebaseAuthErrorMessage(creationError.code),
                    });
                }
             } else {
                 toast({
                    variant: "destructive",
                    title: "Login Failed",
                    description: getFirebaseAuthErrorMessage(error.code),
                });
             }
        } else {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: getFirebaseAuthErrorMessage(error.code),
            });
        }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (!auth) return;
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: error.message || "An error occurred during logout.",
      });
    }
  };

  if (loading) {
    return (
      <Card className="shadow-sm font-ui">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary">
            Loading...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Checking authentication status...</p>
        </CardContent>
      </Card>
    );
  }

  if (user) {
    return (
      <Card className="shadow-sm font-ui">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-headline text-primary">
            Welcome, {user.displayName || user.email}!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>You are successfully logged in.</p>
           <Button onClick={() => router.push('/candidate/dashboard')} className="mt-4">
            Go to Dashboard
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleLogout} variant="destructive">
            Logout
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Dialog>
      <Card className="shadow-sm font-ui">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-headline text-primary">
            Login Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="username">Email ID</Label>
              <Input
                id="username"
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <Link href="#" className="text-primary hover:underline">
                Forgot Password?
              </Link>
              <DialogTrigger asChild>
                 <button type="button" className="text-primary hover:underline">
                  Sign Up Here
                </button>
              </DialogTrigger>
            </div>
            <Button
              type="submit"
              className="w-full bg-destructive hover:bg-destructive/90 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm text-center pt-4">
          <p className="font-bold">For Technical Support, Contact:</p>
          <p>9876543210, 9876543211</p>
          <p className="font-bold mt-2">For Enquiry, Contact:</p>
          <p>9876543212, 9876543213</p>
        </CardFooter>
      </Card>
      <SignupModal />
    </Dialog>
  );
}

export function LoginCard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginCardComponent />
    </Suspense>
  )
}
