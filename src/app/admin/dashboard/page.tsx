
'use client';

import { useMemo } from 'react';
import {
  BookOpen,
  Users,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollection } from '@/firebase/firestore/use-collection';
import { initializeFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export default function DashboardPage() {
  const { firestore } = initializeFirebase();

  const pagesQuery = useMemo(() => firestore ? collection(firestore, 'website_pages') : null, [firestore]);
  const usersQuery = useMemo(() => firestore ? collection(firestore, 'users') : null, [firestore]);

  const { data: pages, loading: pagesLoading } = useCollection(pagesQuery);
  const { data: users, loading: usersLoading } = useCollection(usersQuery);

  const stats = useMemo(() => {
    if (!users) {
      return {
        students: 0,
        staff: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      };
    }

    const students = users.filter(u => u.role === 'candidate' || !u.role).length;
    const staff = users.filter(u => u.role === 'staff').length;

    const allRequests = users.flatMap(user => user.appliedCourses || []);
    const pending = allRequests.filter(req => req.status === 'Pending').length;
    const approved = allRequests.filter(req => req.status === 'Verified').length;
    const rejected = allRequests.filter(req => req.status === 'Rejected').length;

    return { students, staff, pending, approved, rejected };
  }, [users]);


  const statCards = [
    {
      title: 'Total Pages',
      icon: BookOpen,
      count: pages?.length ?? 0,
      color: 'text-sky-500',
      loading: pagesLoading,
    },
    {
      title: 'Total Students',
      icon: Users,
      count: stats.students,
      color: 'text-emerald-500',
      loading: usersLoading,
    },
    {
      title: 'Total Staff',
      icon: Briefcase,
      count: stats.staff,
      color: 'text-amber-500',
      loading: usersLoading,
    },
    {
      title: 'Pending Requests',
      icon: Clock,
      count: stats.pending,
      color: 'text-indigo-500',
      loading: usersLoading,
    },
    {
      title: 'Approved Requests',
      icon: CheckCircle,
      count: stats.approved,
      color: 'text-green-500',
      loading: usersLoading,
    },
    {
      title: 'Rejected Requests',
      icon: XCircle,
      count: stats.rejected,
      color: 'text-rose-500',
      loading: usersLoading,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <Card
            key={card.title}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
                {card.loading ? (
                    <div className="h-10 flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        <div className="text-2xl font-bold">{card.count}</div>
                        <p className="text-xs text-muted-foreground">
                            {card.title}
                        </p>
                    </>
                )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
