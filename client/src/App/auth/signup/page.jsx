import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../../contexts/AuthContext';
import AuthLayout from '../layout';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  rememberMe: z.boolean().optional().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const SignupPage = () => {
  const navigate = useNavigate();
  const { 
    register: registerUser, 
    isAuthenticated, 
    user, 
    error, 
    clearError,
    googleAuth,
    requestPhoneOTP,
    verifyPhoneOTP 
  } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [displayedOTP, setDisplayedOTP] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  const [signupMethod, setSignupMethod] = useState('email'); // 'email' or 'phone'
  const [phoneStep, setPhoneStep] = useState('request'); // 'request' or 'verify'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneName, setPhoneName] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { rememberMe: false },
  });

  const password = watch('password', '');

  // Password strength calculator
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return {
      score,
      label: labels[score - 1] || 'Very Weak',
      color: colors[score - 1] || 'bg-red-500',
      percentage: (score / 5) * 100
    };
  };

  const passwordStrength = getPasswordStrength(password);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/products', { replace: true }); // Customer or other role - NEVER go to /admin/*
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data) => {
    const { confirmPassword, ...userData } = data;
    const result = await registerUser(userData);
    if (result.success && !result.requiresVerification) {
      navigate('/products', { replace: true });
    } else if (result.requiresVerification) {
      setDisplayedOTP(result.otp);
      setUserEmail(userData.email);
      setShowOTPModal(true);
    }
  };

  const handlePhoneRequest = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    const result = await requestPhoneOTP({ phoneNumber });
    if (result.success) {
      setPhoneStep('verify');
      setDisplayedOTP(result.otp);
    }
  };

  const handlePhoneVerify = async (e) => {
    e.preventDefault();
    if (!otp || !phoneName) return;
    const result = await verifyPhoneOTP({ phoneNumber, otp, name: phoneName });
    if (result.success) {
      // Navigation handled by useEffect
    }
  };

  return (
    <>
      {/* DEV OTP Helper */}
      {displayedOTP && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg z-[999] shadow-2xl animate-bounce">
          <strong>🔐 DEV OTP: {displayedOTP}</strong>
          <button onClick={() => setDisplayedOTP(null)} className="ml-4 text-white/80 hover:text-white font-bold">✕</button>
        </div>
      )}

      {showOTPModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Account Created!</h2>
                <p className="text-slate-600 mt-2">Here's your verification code</p>
              </div>
              <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-6">
                <div className="text-4xl font-bold text-blue-600 tracking-widest font-mono">{displayedOTP}</div>
              </div>
              <button
                onClick={() => {
                  setShowOTPModal(false);
                  navigate('/auth/verify-email', { state: { email: userEmail }, replace: true });
                }}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg"
              >
                Continue to Verify →
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthLayout
        title="Create account"
        subtitle="Start your rental journey with SmartRent"
        linkText="Already have an account?"
        linkTo="/auth/login"
        linkLabel="Sign in"
      >
        <div className="mb-8 p-1 bg-slate-100 rounded-xl flex shadow-inner">
          <button
            onClick={() => { setSignupMethod('email'); clearError(); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${signupMethod === 'email' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
          >
            Email
          </button>
          <button
            onClick={() => { setSignupMethod('phone'); clearError(); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${signupMethod === 'phone' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
          >
            Phone
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {signupMethod === 'email' ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">Full Name</label>
              <input {...register('name')} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/50" placeholder="John Doe" />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">Email Address</label>
              <input {...register('email')} type="email" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/50" placeholder="john@example.com" />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPassword ? 'text' : 'password'} className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/50" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Strength: {passwordStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: `${passwordStrength.percentage}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">Confirm Password</label>
              <input {...register('confirmPassword')} type={showConfirmPassword ? 'text' : 'password'} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/50" />
              {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-xs"><span className="px-4 bg-white text-slate-500 font-bold uppercase tracking-wider">Or</span></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin 
                onSuccess={async (credentialResponse) => {
                  await googleAuth(credentialResponse);
                }}
                onError={() => {
                  console.error('❌ Google signup failed');
                }}
              />
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {phoneStep === 'request' ? (
              <form onSubmit={handlePhoneRequest} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+91</span>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-14 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/50"
                      placeholder="00000 00000"
                    />
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all">
                  {isSubmitting ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePhoneVerify} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={phoneName}
                    onChange={(e) => setPhoneName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/50"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-700">OTP Code</label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 text-center text-3xl font-bold tracking-[0.5em] border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/50"
                    placeholder="000000"
                  />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all">
                  {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
                </button>
                <button type="button" onClick={() => setPhoneStep('request')} className="w-full text-sm font-bold text-blue-600 hover:underline py-2">
                  ← Back to phone entry
                </button>
              </form>
            )}
          </div>
        )}
      </AuthLayout>
    </>
  );
};

export default SignupPage;
