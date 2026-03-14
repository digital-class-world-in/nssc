
'use client';

import { useUser, initializeFirebase } from '@/firebase';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function AdminHeader() {
  const { user } = useUser();
  const { auth } = initializeFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut(auth);
    toast({ title: 'Logged out successfully.' });
    router.push('/');
  };

  return (
    <header className="flex h-[60px] items-center justify-between border-b px-6" style={{
        backgroundColor: 'hsl(var(--navbar-primary))',
        color: 'hsl(var(--primary-foreground))'
    }}>
      <div className="font-bold">MPC Admin</div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">{user?.email}</p>
        </div>
        <Avatar className="h-9 w-9">
          <AvatarImage src={user?.photoURL || ''} alt="Admin" />
          <AvatarFallback>
            {user?.email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-white/20">
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </header>
  );
}
