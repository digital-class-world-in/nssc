
import type { Metadata } from 'next';
import { CandidateHeader } from '@/components/candidate-header';

export const metadata: Metadata = {
  title: 'Candidate Dashboard - NSSC Portal',
  description: 'National Skills Sector Councils, New Delhi',
};

export default function CandidateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <CandidateHeader />
      {children}
    </>
  );
}
