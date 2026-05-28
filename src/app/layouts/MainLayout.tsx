import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingCart } from '../components/FloatingCart';
import { BottomNav } from '../components/BottomNav';
import { WhatsAppChat } from '../components/WhatsAppChat';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8fafc' }}>
      <Navbar />
      <main className="flex-1 pb-24 sm:pb-0">
        {children}
      </main>
      <Footer />
      <FloatingCart />
      <WhatsAppChat />
      <BottomNav />
    </div>
  );
}

