'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (res?.ok) {
      router.push('/dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-body">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-zinc-200/50 border border-zinc-100 flex flex-col gap-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-zinc-900 leading-none">Lumina Builder</h1>
          <p className="text-zinc-500 font-body text-sm">Enter your credentials to continue the journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-5 py-3.5 bg-zinc-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-zinc-900 font-medium transition-all outline-none"
                placeholder="admin@hiralamu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Password</label>
              <input
                type="password"
                required
                className="w-full px-5 py-3.5 bg-zinc-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-zinc-900 font-medium transition-all outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dim text-white font-bold py-4 rounded-full transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
          >
            Sign In
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-100"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold text-zinc-400"><span className="bg-white px-2">Or continue with</span></div>
        </div>

        <button
          onClick={() => signIn('google')}
          className="w-full bg-white border border-zinc-200 text-zinc-900 font-bold py-4 rounded-full flex items-center justify-center gap-3 hover:bg-zinc-50 transition-all active:scale-[0.98]"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          Google Account
        </button>

        <p className="text-center text-[11px] text-zinc-400">
          Demo: <span className="text-zinc-600 font-bold">admin@hiralamu.com</span> / <span className="text-zinc-600 font-bold">admin</span>
        </p>
      </div>
    </div>
  );
}
