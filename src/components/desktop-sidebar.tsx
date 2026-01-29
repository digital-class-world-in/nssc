
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Users,
  ImageIcon,
  ShieldCheck,
  Award,
  Edit,
  Home,
  FileText,
  BadgeCheck,
  RefreshCw,
  Copy,
  CreditCard,
  ClipboardList,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const menuItems = [
  { href: '/?page=council-members', label: 'Council Members', icon: Users, id: 'council-members' },
  { href: '/?page=coming-soon', label: 'Photo Gallery', icon: ImageIcon, id: 'photo-gallery' },
  { href: '/?page=coming-soon', label: 'Verification of Certificate', icon: ShieldCheck, id: 'verification-certificate' },
  { href: '/?page=coming-soon', label: 'Permanent Registration', icon: Award, id: 'permanent-registration' },
  { href: '/?page=coming-soon', label: 'Change of Name', icon: Edit, id: 'change-of-name' },
  { href: '/?page=coming-soon', label: 'Change of Address', icon: Home, id: 'change-of-address' },
  { href: '/?page=coming-soon', label: 'NOC', icon: FileText, id: 'noc-page' },
  { href: '/?page=coming-soon', label: 'Good Standing', icon: BadgeCheck, id: 'good-standing' },
  { href: '/?page=coming-soon', label: 'Renewal', icon: RefreshCw, id: 'renewal' },
  { href: '/?page=coming-soon', label: 'Duplicate', icon: Copy, id: 'duplicate' },
  { href: '/?page=coming-soon', label: 'Online Payment', icon: CreditCard, id: 'online-payment' },
  { href: '/?page=coming-soon', label: 'Application Status', icon: ClipboardList, id: 'application-status' },
  { href: '/?page=coming-soon', label: 'Subjectwise Reg. List', icon: List, id: 'subject-wise-reg-list' },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get('page');

  return (
    <aside className="hidden lg:block">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <Button
              key={item.label}
              asChild
              variant="default"
              className={cn(
                'w-full justify-start text-left h-auto py-2.5 rounded-md',
                isActive
                  ? 'bg-destructive hover:bg-destructive/90'
                  : 'bg-primary hover:bg-secondary',
                'text-primary-foreground'
              )}
            >
              <Link href={item.href}>
                <item.icon className="mr-3 h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
