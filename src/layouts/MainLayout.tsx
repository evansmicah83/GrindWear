import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from '../components/CartDrawer';
import { FloatingCart } from '../components/FloatingCart';
import { MobileNav } from './MobileNav';
import { WhatsAppChat } from '../app/components/WhatsAppChat';
import { BottomNav } from '../app/components/BottomNav';
import { api } from '../services/api';
import { AlertTriangle } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export function MainLayout({ children, hideFooter = false }: MainLayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    api.getSettings().then(r => {
      if (r.data?.maintenance_mode === 'true') setMaintenance(true);
    }).catch(() => {});
  }, []);

  if (maintenance) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-6 text-center">
      <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-6">
        <AlertTriangle size={32} className="text-orange-400" />
      </div>
      <h1 className="text-3xl font-black mb-3">We'll be back soon</h1>
      <p className="text-gray-400 max-w-sm">GRIND BYTE is currently undergoing scheduled maintenance. Check back shortly.</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-grind-background">
      <Navbar />
      {/* Spacer for fixed navbar on non-home pages: announcement(36px) + nav(64px) */}
      {!isHome && <div className="h-[100px]" />}
      <main className="flex-1 pb-16 sm:pb-0">
        {children}
      </main>
      {!hideFooter && <Footer />}
      <CartDrawer />
      <FloatingCart />
      <WhatsAppChat />
      <BottomNav />
      <MobileNav />
    </div>
  );
}
