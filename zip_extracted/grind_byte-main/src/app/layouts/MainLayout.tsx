import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingCart } from '../components/FloatingCart';
import { MobileNav } from '../components/MobileNav';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-grind-background">
      <Navbar />
      <main className="flex-1 pb-20 sm:pb-0">
        {children}
      </main>
      <Footer />
      <FloatingCart />
      <MobileNav />
    </div>
  );
}
