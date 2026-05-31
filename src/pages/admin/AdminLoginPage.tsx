import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ShoppingBag, Truck, Package, ArrowRight, Sparkles } from 'lucide-react';
import Swal from 'sweetalert2';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import grindBg from '../../assets/Grind.png';

const swalBase = { customClass: { popup: 'rounded-2xl shadow-xl font-sans' }, confirmButtonColor: '#111827' };

const toastAlert = (icon: 'success' | 'error' | 'warning', title: string, text?: string) =>
  Swal.fire({ ...swalBase, icon, title, text, toast: true, position: 'top-end', showConfirmButton: false, timer: 3500, timerProgressBar: true });

export function AdminLoginPage() {
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already logged in as admin, go straight to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [isLoading, isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      await toastAlert('warning', 'Email required', 'Please enter your admin email address.');
      return;
    }
    if (!password.trim()) {
      await toastAlert('warning', 'Password required', 'Please enter your password to continue.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      await Swal.fire({
        ...swalBase,
        icon: 'success',
        title: 'Welcome back, admin!',
        text: 'Redirecting you to the ecommerce dashboard.',
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err: any) {
      const message = (err?.message || '').toLowerCase();
      if (message.includes('invalid') || message.includes('credentials') || message.includes('password')) {
        await Swal.fire({ ...swalBase, icon: 'error', title: 'Invalid credentials', text: 'The email or password you entered is incorrect. Please try again.' });
      } else if (message.includes('admin')) {
        await Swal.fire({ ...swalBase, icon: 'warning', title: 'Admin access required', text: 'Only authorized admin accounts can sign in here.' });
      } else {
        await Swal.fire({ ...swalBase, icon: 'error', title: 'Sign-in failed', text: 'We could not verify your account right now. Please try again in a moment.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // After login, check role
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user?.role) {
        localStorage.removeItem('grind-token');
        Swal.fire({
          ...swalBase,
          icon: 'error',
          title: 'Access denied',
          text: 'This account does not have admin permissions. Please sign in with an authorized admin account.',
          confirmButtonText: 'Try again',
        });
      }
    }
  }, [isAuthenticated, user, isLoading]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  const perks = [
    { icon: ShoppingBag, text: 'Inventory, orders, payments and support in one secure hub.' },
    { icon: Truck, text: 'Monitor fulfillment, shipping and customer promise delivery.' },
    { icon: ShieldCheck, text: 'Protected access for sensitive business and customer data.' },
    { icon: Package, text: 'Track bestsellers, restocks and store performance at a glance.' },
  ];

  return (
    <div className="min-h-screen flex bg-[linear-gradient(135deg,#f8fbff_0%,#f5f7fb_45%,#eef2ff_100%)] text-gray-900">
      <section className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black flex-col justify-between p-12">
        <img src={grindBg} alt="GRIND BYTE brand background" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,14,24,0.88),rgba(15,23,42,0.72),rgba(17,24,39,0.35))]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="relative z-10">
          <a href="/" className="inline-flex items-center gap-3 no-underline">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <span className="text-white font-black text-base">GB</span>
            </div>
            <div>
              <p className="text-2xl font-black text-white tracking-tight">GRIND BYTE</p>
              <p className="text-white/50 text-[11px] tracking-[0.35em] uppercase">Premium Streetwear</p>
            </div>
          </a>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-[11px] uppercase tracking-[0.35em] text-blue-100/90">Admin Control Center</p>
          <h1 className="mt-4 text-4xl xl:text-5xl font-black text-white leading-tight">
            Power the business behind your best-selling store.
          </h1>
          <p className="mt-4 text-white/70 text-base leading-relaxed">
            Monitor orders, stock, reviews and customer activity from a secure dashboard built for real ecommerce growth.
          </p>
        </div>

        <div className="relative z-10 grid gap-3">
          {perks.map(({ icon: Icon, text }) => (
            <article key={text} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/8 p-3 shadow-lg shadow-black/20 backdrop-blur-md">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                <Icon size={16} />
              </div>
              <p className="text-sm text-white/80">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex-1 flex flex-col min-h-screen bg-transparent relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 left-10 h-32 w-32 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-violet-100/80 blur-3xl" />
          <div className="absolute top-1/4 right-1/3 h-24 w-24 rounded-full bg-cyan-100/70 blur-2xl" />
        </div>

        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/90 backdrop-blur-xl z-10">
          <a href="/" className="inline-flex items-center gap-2 text-xl font-black text-gray-900 no-underline">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-sm font-black">GB</div>
            GRIND BYTE
          </a>
          <a href="/" className="text-sm text-gray-500 hover:text-gray-900">← Store</a>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full max-w-md rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_24px_70px_-25px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-8"
          >
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-blue-700">
                <Sparkles size={12} /> GRIND BYTE commerce hub
              </div>
              <h2 className="mt-3 text-2xl sm:text-3xl font-black text-gray-900">Access the GRIND BYTE admin dashboard</h2>
              <p className="mt-2 text-sm text-gray-500">Securely manage orders, stock, campaigns, and customer experience from a refined ecommerce control center.</p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:hidden">
              {[
                ['Orders', 'Realtime'],
                ['Inventory', 'Low stock alerts'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-gray-100 bg-gray-50/90 p-3 shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    autoComplete="email"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gray-900 via-blue-900 to-violet-900 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </span>
                ) : (
                  <>
                    Continue to dashboard
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-gray-700 shadow-sm">
              Need help? Contact the store operations team at <span className="font-semibold text-gray-900">ops@grindbyte.com</span>.
            </div>

            <p className="mt-6 text-center text-xs text-gray-400">© {new Date().getFullYear()} GRIND BYTE. Secure ecommerce operations.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
