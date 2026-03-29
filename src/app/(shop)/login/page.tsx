'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const { user, loginWithGoogle, sendOtp, verifyOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '/';
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push(redirect);
    }
  }, [user, router, redirect]);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to login with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      await sendOtp(formattedPhone);
      setIsOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Make sure the number is correct.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      await verifyOtp(formattedPhone, otp);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-8 py-24 pt-32 flex justify-center items-center min-h-[80vh]">
      <div className="w-full max-w-md bg-surface-container-lowest p-10 rounded-2xl shadow-sm border border-outline-variant/30">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="LIVO HOMES" className="h-10 w-auto mx-auto mb-6 object-contain" />
          <h1 className="text-3xl font-headline font-extrabold text-on-surface">Welcome Back</h1>
          <p className="text-secondary text-sm mt-2">Sign in to your architectural account</p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-error-container text-on-error-container text-sm rounded-lg border border-error/20 text-center">
            {error}
          </div>
        )}

        {!isOtpSent ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-6">
            <div>
              <label className="block font-semibold text-on-surface-variant text-sm mb-2">Mobile Number</label>
              <div className="flex">
                <span className="flex items-center px-4 bg-surface-container-low rounded-l-lg border-r border-outline-variant/30 text-secondary text-sm">+91</span>
                <input 
                  type="tel" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your mobile number" 
                  className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-r-lg px-4 py-3 text-sm transition-all" 
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="bg-primary text-white w-full mt-4 py-4 rounded-sm font-headline font-black text-[12px] uppercase tracking-[0.3em] hover:bg-brand-accent transition-all duration-700 active:scale-95 shadow-2xl disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-semibold text-on-surface-variant text-sm">Enter OTP</label>
                <button 
                  type="button" 
                  onClick={() => setIsOtpSent(false)}
                  className="text-sm text-primary font-semibold hover:opacity-80 transition-opacity"
                >
                  Change Number
                </button>
              </div>
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code" 
                className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-sm transition-all text-center tracking-[0.5em] font-bold" 
                maxLength={6}
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="bg-primary text-white w-full mt-6 py-4 rounded-sm font-headline font-black text-[10px] uppercase tracking-[0.4em] hover:bg-brand-accent transition-all duration-700 active:scale-95 shadow-2xl disabled:opacity-50"
            >
              {loading ? 'Manifesting Identity...' : 'Sign In'}
            </button>
          </form>
        )}

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-outline-variant/30"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-surface-container-lowest text-secondary">Or continue with</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center gap-3 w-full py-3 px-4 border border-outline-variant/50 rounded-lg font-semibold hover:bg-surface-container-low transition-colors active:scale-95 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <p className="text-center mt-8 text-secondary text-sm">
          Don't have an account? <Link href="/register" className="text-primary font-bold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
