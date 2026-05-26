import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
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
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ email, password, name });
      }
      window.location.href = '/';
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-grind-black mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-600">
              {isLogin
                ? 'Sign in to your GRIND BYTE account'
                : 'Join the GRIND BYTE community today'}
            </p>
          </div>

          <div className="bg-white border border-grind-border rounded-xl p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={18} />}
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={18} />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && (
                <p className="text-sm text-grind-danger bg-red-50 p-3 rounded-lg">
                  {error}
                </p>
              )}

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <a href="/forgot-password" className="text-grind-blue hover:underline">
                    Forgot password?
                  </a>
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-grind-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <Button variant="outline" className="py-2">
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="h-5 w-5" />
                </Button>
                <Button variant="outline" className="py-2">
                  <img src="https://www.facebook.com/favicon.ico" alt="Facebook" className="h-5 w-5" />
                </Button>
                <Button variant="outline" className="py-2">
                  <img src="https://www.apple.com/favicon.ico" alt="Apple" className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-grind-blue hover:underline font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
