
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams as useNextSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileUp,
  ClipboardList,
  FileText,
  UserCog,
  Cog,
  History,
  BookOpen,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useMemo, useEffect, useState } from 'react';
import { collection, doc, getDoc } from 'firebase/firestore';
import { initializeFirebase, useUser } from '@/firebase';

type UserPermissions = { [key: string]: boolean };

const allMenuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
  { href: '/admin/requests', label: 'Requests', icon: Send, id: 'requests' },
  { href: '/admin/pages', label: 'Pages / LMS', icon: BookOpen, isAccordion: true, id: 'pages' },
  { href: '/admin/students', label: 'Students', icon: Users, id: 'students' },
  { href: '/admin/staff', label: 'Staff', icon: Briefcase, id: 'staff' },
  { href: '/admin/documents', label: 'Documents & Downloads', icon: FileUp, id: 'documents' },
  { href: '/admin/forms', label: 'Forms & Submissions', icon: ClipboardList, id: 'forms' },
  { href: '/admin/users-roles', label: 'Users & Roles', icon: UserCog, id: 'users-roles' },
  { href: '/admin/settings', label: 'Settings / Theme', icon: Cog, id: 'settings' },
  { href: '#', label: 'Audit Logs', icon: History, id: 'audit-logs', disabled: true },
];


export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useNextSearchParams();
  const { firestore } = initializeFirebase();
  const { user } = useUser();
  const [menuItems, setMenuItems] = useState(allMenuItems);
  
  const pagesQuery = useMemo(
    () => (firestore ? collection(firestore, 'website_pages') : null),
    [firestore]
  );
  const { data: pages, loading } = useCollection(pagesQuery);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (user && firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === 'staff' && userData.permissions) {
            const userPermissions = userData.permissions as UserPermissions;
            const permittedItems = allMenuItems.filter(item => userPermissions[item.id]);
            setMenuItems(permittedItems);
          } else if (userData.role === 'admin') {
            setMenuItems(allMenuItems); // Admin sees all
          } else {
            setMenuItems([]); // No permissions
          }
        }
      }
    };

    fetchPermissions();
  }, [user, firestore]);

  const sortedPages = useMemo(() => {
    if (!pages) return [];
    return [...pages].sort((a, b) => a.title.localeCompare(b.title));
  }, [pages]);
  
  const getLinkClassName = (href: string) => {
     return cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium h-[46px]',
        pathname === href
          ? 'bg-[hsl(var(--navbar-secondary))] text-white'
          : 'text-gray-300 hover:bg-white/10 hover:text-white'
      )
  };
  
  const getAccordionTriggerClassName = (pathPrefix: string) => {
      return cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium h-[46px] text-gray-300 hover:bg-white/10 hover:text-white hover:no-underline',
        pathname.startsWith(pathPrefix)
          ? 'bg-[hsl(var(--navbar-secondary))] text-white'
          : ''
      )
  }

  return (
    <aside className="w-[240px] text-white flex flex-col" style={{ backgroundColor: 'hsl(var(--navbar-primary))' }}>
      <div className="flex h-[60px] items-center justify-center border-b" style={{ borderColor: 'hsl(var(--navbar-secondary))' }}>
        <h1 className="text-xl font-bold">NSSC Admin</h1>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {menuItems.map((item) => {
             if (item.disabled) {
                return (
                    <div key={item.href} className={cn(getLinkClassName(item.href), 'opacity-50 cursor-not-allowed')}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                    </div>
                )
             }
             if (item.isAccordion) {
                return (
                    <Accordion key={item.href} type="single" collapsible>
                        <AccordionItem value="pages-lms" className="border-b-0">
                            <AccordionTrigger className={getAccordionTriggerClassName(item.href)}>
                                <div className="flex items-center gap-3">
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-1 pl-4">
                            {loading ? (
                                <div className="text-gray-400 text-xs text-center p-2">Loading pages...</div>
                            ) : sortedPages.length > 0 ? (
                                sortedPages.map((page) => (
                                <Link
                                    key={page.id}
                                    href={`/admin/pages?page=${page.id}`}
                                    className={cn(
                                    'flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium',
                                    pathname === '/admin/pages' && searchParams.get('page') === page.id
                                        ? 'bg-black/20 text-white'
                                        : 'text-gray-400 hover:bg-black/20 hover:text-white'
                                    )}
                                >
                                    {page.title}
                                </Link>
                                ))
                            ) : (
                                <div className="text-gray-400 text-xs text-center p-2">No pages found.</div>
                            )}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                );
            }

            return (
                 <Link
                  key={item.href}
                  href={item.href}
                  className={getLinkClassName(item.href)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
            )
        })}
      </nav>
    </aside>
  );
}
