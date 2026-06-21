import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, ShieldAlert } from 'lucide-react';
import { setCredentials } from '../store/authSlice';
import { setCartItems } from '../store/cartSlice';
import GlassCard from '../components/GlassCard';
import axios from 'axios';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1 = Enter Email, 2 = Verify OTP & Reset
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  const evaluatePasswordStrength = (pass) => {
    let strength = 'Weak';
    const hasLength = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[@#$%^&+=!_]/.test(pass);

    const matchCount = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (matchCount === 5) {
      strength = 'Strong';
    } else if (matchCount >= 3) {
      strength = 'Medium';
    } else if (pass.length > 0) {
      strength = 'Weak';
    } else {
      strength = '';
    }
    setPasswordStrength(strength);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8080/api/auth/signin', { email, password });
      dispatch(setCredentials(res.data));
      
      // Pull offline local cart items
      const localCart = JSON.parse(localStorage.getItem('miv_cart') || '[]');
      if (localCart.length > 0) {
        for (const item of localCart) {
          try {
            await axios.post('http://localhost:8080/api/cart', {
              productId: item.product.id,
              quantity: item.quantity
            }, {
              headers: { Authorization: `Bearer ${res.data.accessToken}` }
            });
          } catch (err) {
            console.error("Error syncing offline cart items", err);
          }
        }
      }

      // Sync and retrieve consolidated cart from backend database
      try {
        const cartRes = await axios.get('http://localhost:8080/api/cart', {
          headers: { Authorization: `Bearer ${res.data.accessToken}` }
        });
        dispatch(setCartItems(cartRes.data));
      } catch (err) {
        console.error("Error syncing cart items after login", err);
      }

      // Route based on role
      if (res.data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    try {
      await axios.post('http://localhost:8080/api/auth/forgot-password', { email: forgotEmail });
      setForgotStep(2);
      setForgotSuccess('A 6-digit OTP code has been sent to your email address.');
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to dispatch OTP. Please check email address.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (newPassword !== confirmNewPassword) {
      setForgotError('New passwords do not match.');
      return;
    }

    const passRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!_]).{8,}$/;
    if (!passRegex.test(newPassword)) {
      setForgotError('Password must be at least 8 characters long and contain 1 uppercase, 1 lowercase, 1 number, and 1 special character.');
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/auth/reset-password', {
        email: forgotEmail,
        otp: otpCode,
        password: newPassword,
        confirmPassword: confirmNewPassword
      });
      setForgotSuccess('Your password has been successfully reset! You can now close this and login.');
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotEmail('');
        setOtpCode('');
        setNewPassword('');
        setConfirmNewPassword('');
        setForgotStep(1);
        setForgotSuccess('');
      }, 3000);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Verification failed. Please check OTP code.');
    }
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-6 py-12 overflow-hidden">
      
      {/* Glow Spots */}
      <div className="blur-spot blur-emerald top-1/4 left-1/4" />
      <div className="blur-spot blur-teal bottom-1/4 right-1/4" />

      <GlassCard className="w-full max-w-md p-8 relative z-10" hover={false}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-400 text-xs font-semibold mb-3">
            <Sparkles size={12} /> Secure Login
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to manage orders, wishlists, and buy traditional snacks.</p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold mb-6">
            <ShieldAlert size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="w-full pl-11 pr-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[10px] font-bold text-brand hover:text-brand-dark transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-bold text-xs text-white bg-brand hover:bg-brand-dark active:scale-95 transition-all shadow-md shadow-brand/20 disabled:bg-slate-200 disabled:text-slate-400"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand hover:text-brand-dark transition-colors">
            Create Account
          </Link>
        </p>

      </GlassCard>

      {/* Forgot Password OTP Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200/40 dark:border-emerald-950/30 glass-panel animate-slide-up p-8 relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Reset Password</h3>
            <p className="text-xs text-slate-400 mb-6">Recover your account credentials using email OTP authentication.</p>

            {forgotError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-xl mb-4 font-semibold">
                {forgotError}
              </div>
            )}
            {forgotSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs rounded-xl mb-4 font-semibold">
                {forgotSuccess}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="registered-email@example.com"
                    className="w-full px-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-brand hover:bg-brand-dark active:scale-95 transition-all"
                >
                  Send OTP Code
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full px-4 py-3 rounded-2xl text-xs outline-none text-center font-bold tracking-widest bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        evaluatePasswordStrength(e.target.value);
                      }}
                      placeholder="min 8 characters"
                      className="w-full px-4 pr-11 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordStrength && (
                    <div className="mt-2 text-[10px] font-bold flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className={`h-full transition-all ${
                          passwordStrength === 'Strong' ? 'w-full bg-emerald-500' : 
                          passwordStrength === 'Medium' ? 'w-2/3 bg-yellow-500' : 'w-1/3 bg-rose-500'
                        }`} />
                      </div>
                      <span className={
                        passwordStrength === 'Strong' ? 'text-emerald-600' : 
                        passwordStrength === 'Medium' ? 'text-yellow-600' : 'text-rose-500'
                      }>{passwordStrength}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="re-enter new password"
                      className="w-full px-4 pr-11 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-brand hover:bg-brand-dark active:scale-95 transition-all"
                >
                  Reset Password
                </button>
                <button
                  type="button"
                  onClick={() => setForgotStep(1)}
                  className="w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors font-semibold"
                >
                  Back to Email entry
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// Simple placeholder for X close icon in forgot modal
const X = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
