import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ShoppingBag, Shield, Truck, Package } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';
import grindBg from '../assets/Grind.png';

const PERKS = [
  { icon: ShoppingBag, text: 'Exclusive member-only drops & early access' },
  { icon: Truck, text: 'Free shipping on orders over KES 2,500' },
  { icon: Shield, text: 'Secure checkout & easy returns' },
  { icon: Package, text: 'Real-time order tracking' },
];

const swalBase = { customClass: { popup: 'rounded-2xl shadow-xl font-sans' }, confirmButtonColor: '#111827' };

const toastAlert = (icon: 'success' | 'error' | 'warning', title: string, text?: string) =>
  Swal.fire({ ...swalBase, icon, title, text, toast: true, position: 'top-end', showConfirmButton: false, timer: 3500, timerProgressBar: true });

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/';

  const validate = (): boolean => {
    if (!isLogin && !name.trim()) {
      toastAlert('warning', 'Name required', 'Please enter your full name.'); return false;
    }
    if (!email.trim()) {
      toastAlert('warning', 'Email required', 'Please enter your email address.'); return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toastAlert('error', 'Invalid email', 'Please enter a valid email address.'); return false;
    }
    if (!password) {
      toastAlert('warning', 'Password required', 'Please enter your password.'); return false;
    }
    if (!isLogin && password.length < 6) {
      toastAlert('error', 'Password too short', 'Password must be at least 6 characters.'); return false;
    }
    if (!isLogin && password !== confirmPassword) {
      toastAlert('error', 'Passwords do not match', 'Make sure both passwords are identical.'); return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isLogin) {
        const res = await login(email, password) as any;
        const role = res?.user?.role ?? res?.role;
        await Swal.fire({ ...swalBase, icon: 'success', title: 'Welcome back! 👋', text: 'You have signed in successfully.', timer: 1800, showConfirmButton: false });
        navigate(role === 'admin' ? '/admin' : from, { replace: true });
      } else {
        await register({ email, password, name });
        await Swal.fire({ ...swalBase, icon: 'success', title: `Account created! 🎉`, text: `Welcome to GRIND BYTE, ${name.split(' ')[0]}!`, timer: 2000, showConfirmButton: false });
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('invalid') || msg.includes('credentials') || msg.includes('password')) {
        Swal.fire({ ...swalBase, icon: 'error', title: 'Wrong credentials', text: 'The email or password you entered is incorrect. Please try again.' });
      } else if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
        Swal.fire({ ...swalBase, icon: 'warning', title: 'Email already registered', text: 'An account with this email already exists.', confirmButtonText: 'Sign In Instead' })
          .then(r => { if (r.isConfirmed) switchMode(); });
      } else if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed')) {
        Swal.fire({ ...swalBase, icon: 'error', title: 'Connection error', text: 'Could not reach the server. Make sure the backend is running.' });
      } else {
        Swal.fire({ ...swalBase, icon: 'error', title: 'Something went wrong', text: 'Please try again in a moment.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(v => !v);
    setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block lg:w-5/12 xl:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-black flex-col justify-between p-12">
        <img src={grindBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-transparent" />

        <div className="relative z-10">
          <a href="/" className="inline-flex items-center gap-3 no-underline">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">GB</span>
            </div>
            <span className="text-2xl font-black text-white tracking-tight">GRIND BYTE</span>
          </a>
          <p className="text-white/50 text-xs mt-1 tracking-widest uppercase">Premium Kenyan Streetwear</p>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
            WEAR THE<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">GRIND</span>
          </h2>
          <p className="text-white/60 text-base xl:text-lg max-w-sm leading-relaxed">
            Premium streetwear designed for the modern generation. Quality meets culture in every piece.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {PERKS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-white" />
              </div>
              <span className="text-white/70 text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
        <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <a href="/" className="inline-flex items-center gap-2 text-xl font-black text-gray-900 no-underline">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">GB</span>
            </div>
            GRIND BYTE
          </a>
          <a href="/" className="text-sm text-gray-500 hover:text-gray-900 no-underline">← Back to store</a>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
          <div className="w-full max-w-md">

            <div className="flex bg-white border border-gray-200 rounded-xl p-1 mb-8 shadow-sm">
              {['Sign In', 'Create Account'].map((label, i) => (
                <button key={label} type="button" onClick={() => { setIsLogin(i === 0); setName(''); setEmail(''); setPassword(''); setConfirmPassword(''); }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${isLogin === (i === 0) ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
                  {label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={isLogin ? 'login' : 'register'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

                <div className="mb-6">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{isLogin ? 'Welcome back 👋' : 'Join GRIND BYTE'}</h1>
                  <p className="text-gray-500 text-sm mt-1.5">{isLogin ? 'Sign in to your account to continue shopping.' : 'Create your account and start shopping today.'}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                  {!isLogin && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Full Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name"
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white transition-all" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white transition-all" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Password</label>
                      {isLogin && <a href="/forgot-password" className="text-xs text-blue-600 hover:underline no-underline">Forgot password?</a>}
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password"
                        className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white transition-all" />
                      <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {!isLogin && <p className="text-xs text-gray-400 mt-1.5">Minimum 6 characters</p>}
                  </div>

                  {!isLogin && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm your password"
                          className={`w-full pl-10 pr-11 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white transition-all ${confirmPassword && confirmPassword !== password ? 'border-red-300 focus:ring-red-400' : 'border-gray-200'}`} />
                        <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {confirmPassword && confirmPassword !== password && (
                        <p className="text-xs text-red-500 mt-1.5">⚠ Passwords do not match</p>
                      )}
                      {confirmPassword && confirmPassword === password && (
                        <p className="text-xs text-green-600 mt-1.5">✓ Passwords match</p>
                      )}
                    </div>
                  )}

                  {isLogin && (
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 cursor-pointer" />
                      <span className="text-sm text-gray-600">Keep me signed in</span>
                    </label>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm mt-2">
                    {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{isLogin ? 'Sign In' : 'Create Account'}<ArrowRight size={16} /></>}
                  </button>
                </form>

                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">OR</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button type="button" className="flex items-center justify-center gap-2.5 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer bg-white">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" /> Google
                  </button>
                  <button type="button" className="flex items-center justify-center gap-2.5 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer bg-white">
                    <img src="https://www.facebook.com/favicon.ico" alt="Facebook" className="w-4 h-4" /> Facebook
                  </button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <button type="button" onClick={switchMode} className="text-gray-900 font-semibold hover:underline cursor-pointer">
                    {isLogin ? 'Sign up free' : 'Sign in'}
                  </button>
                </p>

                <p className="text-center text-xs text-gray-400 mt-4 px-2">
                  By continuing, you agree to our{' '}
                  <a href="/terms" className="underline hover:text-gray-600">Terms of Service</a> and{' '}
                  <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>.
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}