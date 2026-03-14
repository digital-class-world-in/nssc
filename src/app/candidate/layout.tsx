'use client';

import { CandidateHeader } from '@/components/candidate-header';

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
