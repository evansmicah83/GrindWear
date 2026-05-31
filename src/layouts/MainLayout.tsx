import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from '../components/CartDrawer';
import { FloatingCart } from '../components/FloatingCart';
import { MobileNav } from './MobileNav';
import { api } from '../services/api';
import { AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

interface MainLayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export function MainLayout({ children, hideFooter = false }: MainLayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [maintenance, setMaintenance] = useState(false);
  const { isAuthenticated, isVerified, user, resendVerificationEmail } = useAuth();
  const [showBanner, setShowBanner] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    api.getSettings().then(r => {
      if (r.data?.maintenance_mode === 'true') setMaintenance(true);
    }).catch(() => {});
  }, []);

  const handleResend = async () => {
    if (!user?.email) return;
    setIsSending(true);
    try {
      await resendVerificationEmail(user.email);
      Swal.fire({
        icon: 'success',
        title: '✉️ Email sent!',
        text: 'Check your inbox (and spam folder) for a verification link.',
        timer: 4000,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: err.message || 'Could not resend email. Please try again.',
        timer: 4000,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDismiss = () => setShowBanner(false);

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
      
      {/* Email Verification Banner - Shows for logged-in, unverified users */}
      {isAuthenticated && !isVerified && showBanner && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm">Please verify your email address</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Verify your email to secure your account and unlock all features.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleResend}
                  disabled={isSending}
                  className="text-sm font-medium text-amber-700 hover:text-amber-900 underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Resend Email'
                  )}
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-amber-500 hover:text-amber-700 p-1 -mr-1"
                  title="Dismiss"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Spacer for fixed navbar on non-home pages: announcement(36px) + nav(64px) + banner(48px if visible) */}
      {!isHome && <div className="h-[100px]" />}
      {isAuthenticated && !isVerified && showBanner && <div className="h-12" />}
      
      <main className="flex-1 pb-16 sm:pb-0">
        {children}
      </main>
      {!hideFooter && <Footer />}
      <CartDrawer />
      <FloatingCart />
      <MobileNav />
    </div>
  );
}
