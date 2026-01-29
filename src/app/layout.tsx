import type { Metadata } from 'next';
import './globals.css';
import { Open_Sans, Merriweather, Montserrat, Poppins, Lato, Inter, Source_Code_Pro, Space_Mono, Work_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Suspense } from 'react';

// ──────────────────────────────────────────────
// Fonts
// ──────────────────────────────────────────────
const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
});

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-merriweather',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
});

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
});

export const metadata: Metadata = {
  title: 'NSSC Portal',
  description: 'National Skills Sector Councils, New Delhi',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'font-body antialiased',
          openSans.variable,
          merriweather.variable,
          montserrat.variable,
          poppins.variable,
          lato.variable,
          inter.variable,
          sourceCodePro.variable,
          spaceMono.variable,
          workSans.variable
        )}
      >
        <FirebaseClientProvider>
          <Suspense
            fallback={
              <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 z-50">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">Loading NSSC Portal...</p>
                </div>
              </div>
            }
          >
            {children}
          </Suspense>

          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}


git