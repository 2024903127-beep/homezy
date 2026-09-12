import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import PermissionPrompt from '@/components/PermissionPrompt';
import { AuthProvider } from '@/lib/authContext';
import { LocationProvider } from '@/lib/locationContext';

export const metadata: Metadata = {
  title: 'Homezy - Book Trusted Home Services at Doorstep in 60 Mins',
  description:
    'Book verified home services at your doorstep. Cleaning, AC repair, electricians, plumbers, painters, pest control, and salon professionals. 60-min express arrival.',
  keywords:
    'home services, cleaning, electrician, plumber, AC repair, beauty, carpentry, Homezy, home maintenance India',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col bg-white text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <AuthProvider>
          <LocationProvider>
            <Navbar />
            <main className="flex-grow pt-16">{children}</main>
            <Footer />
            <AuthModal />
            <PermissionPrompt />
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
