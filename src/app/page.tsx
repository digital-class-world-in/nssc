
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bell,
  Download,
  FileText,
  Megaphone,
  SquarePen,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Slideshow } from '@/components/slideshow';
import { WelcomeSection } from '@/components/welcome-section';
import { LoginCard } from '@/components/login-card';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { DesktopSidebar } from '@/components/desktop-sidebar';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-96">
      <h2 className="text-3xl font-bold text-primary mb-4">Coming Soon!</h2>
      <p className="text-muted-foreground max-w-md">This section is currently under construction. Please check back later for updates.</p>
    </div>
  )
}

function CouncilMembers() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-96">
      <Users className="h-16 w-16 text-primary mb-4" />
      <h2 className="text-3xl font-bold text-primary mb-4">Council Members</h2>
      <p className="text-muted-foreground max-w-md">Information about our esteemed council members will be displayed here.</p>
    </div>
  )
}


function MainContent() {
  const searchParams = useSearchParams();
  const page = searchParams.get('page');

  const renderContent = () => {
    switch (page) {
      case 'council-members':
        return <CouncilMembers />;
      case 'coming-soon':
        return <ComingSoon />;
      default:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <WelcomeSection />
              </div>
              <div>
                <LoginCard />
              </div>
            </div>
            <Slideshow />
            <InfoCards />
          </div>
        );
    }
  }

  return renderContent();
}


function InfoCard({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ElementType;
  items: {
    text: string;
    href: string;
    new?: boolean;
    linkText?: string;
    linkHref?: string;
  }[];
}) {
  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="text-center p-4">
        <div className="mx-auto bg-primary/10 text-primary rounded-full h-16 w-16 flex items-center justify-center mb-2">
          <Icon className="h-8 w-8" />
        </div>
        <CardTitle className="font-headline text-lg font-bold text-gray-800">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ul className="space-y-3 font-body text-sm">
          {items.map((item, index) => (
            <li key={index} className="border-b last:border-b-0 pb-3">
              <Link
                href={item.href}
                className="flex items-start gap-2 text-primary hover:underline"
              >
                <FileText className="h-4 w-4 mt-1 text-primary/60 shrink-0" />
                <span className="flex-1">
                  {item.text}
                  {item.new && (
                    <span className="text-xs text-red-500 font-bold ml-2 animate-pulse">
                      NEW
                    </span>
                  )}
                  {item.linkText && (
                    <Link
                      href={item.linkHref || '#'}
                      className="text-primary hover:underline ml-1"
                    >
                      {item.linkText}
                    </Link>
                  )}
                </span>
              </Link>
            </li>
          ))}
          {items.length === 0 && (
            <p className="text-center text-gray-500">No records found.</p>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

function InfoCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <InfoCard
        title="Announcements"
        icon={Megaphone}
        items={[
          {
            text: 'Result of Diploma in Medical Laboratory Technology (DMLT) Second Year Examination, April-2024',
            href: '/?page=coming-soon',
            new: true,
          },
          {
            text: 'Regarding examination fees of Medical Laboratory Technology, first and second year examination summer-2024',
            href: '/?page=coming-soon',
          },
        ]}
      />
      <InfoCard
        title="Notifications"
        icon={Bell}
        items={[
          {
            text: 'Regarding Change in Renewal process of Registration',
            href: '/?page=coming-soon',
          },
          { text: 'List of Holidays-2024', href: '/?page=coming-soon' },
        ]}
      />
      <InfoCard
        title="Downloads"
        icon={Download}
        items={[
          { text: 'Application Form for Registration', href: '/?page=coming-soon' },
          { text: 'Affidavit for Change of Name', href: '/?page=coming-soon' },
        ]}
      />
      <InfoCard
        title="Instructions"
        icon={SquarePen}
        items={[
          {
            text: 'User Manual For Online Application Submission',
            href: '/?page=coming-soon',
          },
          { text: 'Instructions for Online Payment', href: '/?page=coming-soon' },
        ]}
      />
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
          <DesktopSidebar />
          <main className="flex-1">
             <Suspense fallback={<div>Loading...</div>}>
                <MainContent />
              </Suspense>
          </main>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
