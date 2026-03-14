
"use client";

import Link from 'next/link';
import { Copyright, ChevronsRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <Link href={href} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm">
    <ChevronsRight className="w-3 h-3" />
    {children}
  </Link>
);

export function SiteFooter() {
  const [visits, setVisits] = useState({ today: 0, total: 0 });
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    // This should be replaced with actual analytics data
    setVisits({
      today: Math.floor(Math.random() * 200) + 100,
      total: Math.floor(Math.random() * 10000) + 50000,
    });
    setLastUpdated(new Date().toLocaleDateString('en-GB'));
  }, []);


  return (
    <footer className="bg-[#1C1C1C] text-white mt-auto font-body">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <h3 className="font-headline text-lg font-bold border-b border-gray-600 pb-2 mb-4">Archives</h3>
            <div className="space-y-2">
              <FooterLink href="/?page=coming-soon">Notifications</FooterLink>
              <FooterLink href="/?page=coming-soon">Instructions</FooterLink>
              <FooterLink href="/?page=coming-soon">Downloads</FooterLink>
              <FooterLink href="/?page=coming-soon">Acts & Rules</FooterLink>
            </div>
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold border-b border-gray-600 pb-2 mb-4">Related Links</h3>
            <div className="space-y-2">
              <FooterLink href="/?page=coming-soon">Important Links</FooterLink>
              <FooterLink href="/?page=coming-soon">Terms & Conditions</FooterLink>
              <FooterLink href="/?page=coming-soon">Disclaimer</FooterLink>
              <FooterLink href="/?page=coming-soon">Site Map</FooterLink>
            </div>
          </div>
          
            <div>
              <h3 className="font-headline text-lg font-bold border-b border-gray-600 pb-2 mb-4">Other</h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-gray-300 text-sm pt-2"><ChevronsRight className="w-3 h-3" />Today's Visits : {visits.today > 0 ? visits.today : '...'}</p>
                <p className="flex items-center gap-2 text-gray-300 text-sm"><ChevronsRight className="w-3 h-3" />Total Visits : {visits.total > 0 ? visits.total : '...'}</p>
                <p className="flex items-center gap-2 text-gray-300 text-sm"><ChevronsRight className="w-3 h-3" />Last updated on : {lastUpdated || '...'}</p>
              </div>
            </div>
        </div>
      </div>
      <div className="bg-[#343a40] text-gray-400">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row justify-between items-center text-xs">
          <p className="flex items-center gap-1">
            <Copyright className="w-3 h-3" /> 2017 - National Skills Sector Councils
          </p>
          <p>
            Web Designed and Developed by - Integrated Business Solutions
          </p>
        </div>
      </div>
    </footer>
  );
}
