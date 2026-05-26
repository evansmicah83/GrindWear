import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) await login(email, password);
      else await register({ email, password, name });
      window.location.href = '/';
    } catch {
      setError('Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-grind-black relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558769132-cb1aea3c8a7e?w=800')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-grind-black via-grind-black/95 to-grind-black/80" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-grind-blue/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-grind-purple/20 rounded-full blur-3xl" />

        <div className="relative">
          <a href="/" className="text-2xl font-black text-white">
            GRIND<span className="text-grind-blue">BYTE</span>
          </a>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            Kenya's Premier<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-grind-blue to-grind-purple">
              Streetwear Brand
            </span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Join thousands of style-forward Kenyans who trust GRIND BYTE for premium streetwear.
          </p>
          <div className="space-y-3">
            {['Early access to new drops', 'Exclusive member discounts', 'Free shipping on orders over KES 5,000'].map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-grind-blue/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-grind-blue" />
                </div>
                <span className="text-gray-300 text-sm">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-gray-600">© 2026 GRIND BYTE. Made in Kenya 🇰🇪</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <a href="/" className="text-2xl font-black">
              GRIND<span className="text-grind-blue">BYTE</span>
            </a>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-8">
                <h1 className="text-2xl font-black text-grind-black mb-1">
                  {isLogin ? 'Welcome back 👋' : 'Create account'}
                </h1>
                <p className="text-gray-500 text-sm">
                  {isLogin ? 'Sign in to your GRIND BYTE account' : 'Join the GRIND BYTE community today'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                    <input
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue bg-white"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue bg-white"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded accent-grind-black" />
                      <span className="text-gray-600">Remember me</span>
                    </label>
                    <a href="/forgot-password" className="text-grind-blue hover:underline font-medium">
                      Forgot password?
                    </a>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-grind-black text-white rounded-xl font-bold text-sm hover:bg-grind-black/85 transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <span className="animate-pulse">Please wait...</span>
                  ) : (
                    <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or continue with</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Google', icon: 'https://www.google.com/favicon.ico' },
                  { label: 'Facebook', icon: 'https://www.facebook.com/favicon.ico' },
                  { label: 'Apple', icon: 'https://www.apple.com/favicon.ico' },
                ].map(({ label, icon }) => (
                  <button
                    key={label}
                    className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                  >
                    <img src={icon} alt={label} className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              <p className="mt-6 text-center text-sm text-gray-500">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  className="text-grind-blue hover:underline font-semibold"
                >
                  {isLogin ? 'Sign up free' : 'Sign in'}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
