'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const validateForm = () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password. Please try again.');
        setIsLoading(false);
      } else if (res?.ok) {
        setSuccess(true);
        // Small delay to show success state
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 800);
      } else {
        setError('Something went wrong. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('A network error occurred. Please check your connection.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-body">
      <div className="w-full max-w-md bg-white rounded-2xl p-10 shadow-2xl shadow-zinc-200/50 border border-zinc-100 flex flex-col gap-8 transition-all duration-300">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-zinc-900 leading-none">SoloSite</h1>
          <p className="text-zinc-500 font-body text-sm">Enter your credentials to continue the journey.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Successfully signed in! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider ml-1">Email Address</label>
              <input
                type="email"
                disabled={isLoading || success}
                className={`w-full px-5 py-3.5 bg-zinc-50 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 text-zinc-900 font-medium transition-all outline-none ${
                  error && !email.includes('@') ? 'border-red-200 bg-red-50/30' : 'border-transparent focus:border-primary/20'
                }`}
                placeholder="admin@admin.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider ml-1">Password</label>
              <input
                type="password"
                disabled={isLoading || success}
                className={`w-full px-5 py-3.5 bg-zinc-50 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 text-zinc-900 font-medium transition-all outline-none ${
                  error && password.length < 6 ? 'border-red-200 bg-red-50/30' : 'border-transparent focus:border-primary/20'
                }`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || success}
            className={`w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary-dim text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing In...</span>
              </>
            ) : success ? (
              <span>Success!</span>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="flex justify-center">
           <button 
             type="button" 
             onClick={() => router.push('/')}
             className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors font-medium"
           >
             ← Back to landing
           </button>
        </div>
      </div>
    </div>
  );
}
