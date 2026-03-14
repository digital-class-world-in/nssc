
"use client";

import Link from 'next/link';
import {
  Menu,
  Search,
  Home,
  Info,
  Mail,
  Scale,
  BookOpen,
  Lock,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { Emblem } from './emblem';
import { NsscLogo } from './nssc-logo';
import { Input } from '@/components/ui/input';
import { Dialog, DialogTrigger } from './ui/dialog';
import { AdminLoginModal } from './admin-login-modal';
import { useState } from 'react';

const navItems = [
  { title: 'Home', href: '/', icon: Home },
  { title: 'About', href: '/?page=coming-soon', icon: Info },
  { title: 'Contact', href: '/?page=coming-soon', icon: Mail },
  { title: 'RTI', href: '/?page=coming-soon', icon: Scale },
  { title: 'Act & Rules', href: '/?page=coming-soon', icon: BookOpen },
];

export function SiteHeader() {
  const [loginType, setLoginType] = useState<'admin' | 'staff'>('admin');

  return (
    <Dialog>
      <header className="shadow-md font-ui bg-card z-50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <NsscLogo className="h-20 w-20 border border-black rounded-full" />
                <h1 className="font-headline text-2xl md:text-3xl font-bold text-primary tracking-wide hidden sm:block uppercase">
                    National Skills Sector Councils
                </h1>
            </div>
            <div className="flex justify-end">
                <Emblem className="h-16 w-16 hidden md:block" />
            </div>
          </div>
          <h1 className="font-headline text-xl font-bold text-primary text-center mt-2 sm:hidden uppercase">
            National Skills Sector Councils
          </h1>
        </div>
        <div className="bg-primary border-t border-secondary">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
                <div className="lg:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-secondary">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] bg-primary text-primary-foreground p-0 pt-8">
                      <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                       <nav className="flex flex-col gap-2 p-4">
                        {navItems.map((item) => (
                          <Button
                            key={item.title}
                            asChild
                            variant={'ghost'}
                            className='justify-start text-lg hover:bg-secondary'
                          >
                            <Link href={item.href}>
                              <item.icon className="mr-3 h-5 w-5" />
                              {item.title}
                            </Link>
                          </Button>
                        ))}
                         <DialogTrigger asChild>
                            <Button
                                variant={'ghost'}
                                className='justify-start text-lg hover:bg-secondary'
                                onClick={() => setLoginType('admin')}
                            >
                                <Lock className="mr-3 h-5 w-5" />
                                Admin Login
                            </Button>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                            <Button
                                variant={'ghost'}
                                className='justify-start text-lg hover:bg-secondary'
                                onClick={() => setLoginType('staff')}
                            >
                                <User className="mr-3 h-5 w-5" />
                                Staff Login
                            </Button>
                        </DialogTrigger>
                      </nav>
                    </SheetContent>
                  </Sheet>
                </div>
                <nav className="hidden lg:flex items-center space-x-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="text-primary-foreground px-3 py-2 rounded-md text-sm font-bold uppercase hover:bg-secondary transition-colors flex items-center gap-2"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  ))}
                   <DialogTrigger asChild>
                     <button
                        onClick={() => setLoginType('admin')}
                        className="text-primary-foreground px-3 py-2 rounded-md text-sm font-bold uppercase hover:bg-secondary transition-colors flex items-center gap-2"
                      >
                        <Lock className="h-4 w-4" />
                        Admin Login
                      </button>
                  </DialogTrigger>
                   <DialogTrigger asChild>
                     <button
                        onClick={() => setLoginType('staff')}
                        className="text-primary-foreground px-3 py-2 rounded-md text-sm font-bold uppercase hover:bg-secondary transition-colors flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Staff Login
                      </button>
                  </DialogTrigger>
                </nav>
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="bg-primary-foreground/20 text-primary-foreground border-secondary placeholder:text-primary-foreground/70 h-9 pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/70" />
                </div>
            </div>
          </div>
        </div>
      </header>
      <AdminLoginModal forStaff={loginType === 'staff'} />
    </Dialog>
  );
}
