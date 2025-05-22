
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://gracanica-duel.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: 'Gračanica Duel - Glasanje za Zajednice',
  description: 'Glasajte za svoju omiljenu zajednicu u Gračanici! Pratite rang listu i pomozite svojoj zajednici da pobijedi u Gračanica Duelu.',
  keywords: ['Gračanica', 'duel', 'glasanje', 'zajednice', 'rang lista', 'Bosna i Hercegovina', 'lokalne zajednice', 'takmičenje', 'community ranking', 'voting app'],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // manifest: '/manifest.json', // You can add a manifest.json later for PWA capabilities
  openGraph: {
    title: 'Gračanica Duel - Glasanje za Zajednice',
    description: 'Glasajte za svoju omiljenu zajednicu u Gračanici i pratite rang listu!',
    url: APP_URL,
    siteName: 'Gračanica Duel',
    images: [
      {
        url: '/og-image.png', // Relative to public folder or use absolute URL if hosted elsewhere
        width: 1200,
        height: 630,
        alt: 'Gračanica Duel - Rang Lista Zajednica',
      },
    ],
    locale: 'bs_BA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gračanica Duel - Glasanje za Zajednice',
    description: 'Glasajte za svoju omiljenu zajednicu u Gračanici i pratite rang listu!',
    images: [`${APP_URL}/og-image.png`], // Needs to be an absolute URL for Twitter
    // creator: '@yourTwitterHandle', // Optional: Add your Twitter handle
  },
  // Optional: Add icons for favicons, etc.
  // icons: {
  //   icon: '/favicon.ico',
  //   apple: '/apple-touch-icon.png',
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bs">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <div className="flex-grow">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
