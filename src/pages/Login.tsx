import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Github, Facebook, User as UserIcon } from 'lucide-react';
import { BackgroundPaths } from '../components/ui/background-paths';
import { Button as NeonButton } from '../components/ui/neon-button';
import { StarButton } from '../components/ui/star-button';
import { useApp } from '../context/AppContext';

export function Login() {
  const navigate = useNavigate();
  const { login, loginWithEmail, signUpWithEmail, state, authError } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  React.useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [state.isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(formData.email, formData.password, formData.name);
      } else {
        await loginWithEmail(formData.email, formData.password);
      }
      // Navigation is handled by useEffect on state.isAuthenticated
    } catch (err: any) {
      // Error is handled by context and displayed via toast/authError
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await login();
      console.log("Google login successful");
    } catch (err: any) {
      console.error("Google login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundPaths title="Welcome Back">
      <div className="w-full max-w-md mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-gray-200 dark:border-neutral-800 shadow-2xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
              {isSignUp ? 'Create Account' : 'Login'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-bold">
              {isSignUp ? 'Join the EcoDrive community' : 'Access your EcoDrive dashboard'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold">
                {authError}
              </div>
            )}
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl focus:ring-2 focus:ring-[#065A82] font-bold text-gray-900 dark:text-white transition-all"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl focus:ring-2 focus:ring-[#065A82] font-bold text-gray-900 dark:text-white transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl focus:ring-2 focus:ring-[#065A82] font-bold text-gray-900 dark:text-white transition-all"
                  required
                />
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between px-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-[#065A82] focus:ring-[#065A82]" />
                  <span className="text-xs font-bold text-gray-500">Remember me</span>
                </label>
                <button type="button" className="text-xs font-black text-[#065A82] hover:underline uppercase tracking-wider">Forgot Password?</button>
              </div>
            )}

            <StarButton 
              type="submit" 
              disabled={loading}
              className="w-full h-14 rounded-2xl text-lg font-black flex items-center justify-center gap-2 disabled:opacity-50" 
              lightColor="#065A82"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Login')} <ArrowRight size={20} />
            </StarButton>
          </form>

          <div className="mt-8">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-neutral-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-black">
                <span className="bg-white dark:bg-neutral-900 px-4 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <NeonButton 
                variant="ghost" 
                disabled={loading}
                className="h-14 rounded-2xl flex items-center justify-center gap-3 font-black w-full bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 shadow-sm disabled:opacity-50"
                onClick={handleGoogleLogin}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Continue with Google</span>
              </NeonButton>
            </div>
          </div>

          <p className="text-center mt-8 text-sm font-bold text-gray-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#065A82] font-black hover:underline"
            >
              {isSignUp ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </motion.div>
      </div>
    </BackgroundPaths>
  );
}
