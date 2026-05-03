'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TopNavBar } from '@/components/TopNavBar';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleCreateAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAdminLoading(true);
    setAdminError(null);
    setAdminSuccess(null);

    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      });

      if (res.ok) {
        setAdminSuccess('Administrator account created successfully!');
        (e.target as HTMLFormElement).reset();
      } else {
        const data = await res.json();
        setAdminError(data.error || 'Failed to create administrator account.');
      }
    } catch (err) {
      setAdminError('A network error occurred. Please try again.');
    } finally {
      setIsAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-body">
      <TopNavBar userEmail={session?.user?.email} />
      <main className="pt-16 pb-20 px-8 max-w-screen-2xl mx-auto flex flex-col md:flex-row gap-16 font-body">

        <aside className="hidden md:flex flex-col w-64 sticky top-32 h-fit gap-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-900 font-semibold bg-white rounded-xl shadow-sm border border-zinc-100 transition-all">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Profile
          </button>
          <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Sign Out
          </button>
        </aside>


        <section className="flex-1 space-y-12">
          <header>
            <h1 className="text-5xl font-extrabold tracking-tighter text-zinc-900 mb-4 font-headline uppercase leading-none">Account Settings</h1>
            <p className="text-zinc-500 text-lg max-w-2xl">Manage your editorial profile and subscription details.</p>
          </header>

          <div className="bg-white rounded-2xl p-10 shadow-sm border border-zinc-100">
            <h2 className="text-2xl font-bold text-zinc-900 mb-8 font-headline tracking-tighter uppercase">Profile Identity</h2>
            <div className="flex items-start gap-12">
              <div className="relative group cursor-pointer w-32 h-32 flex-shrink-0">
                <div className="w-full h-full rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-4xl shadow-lg group-hover:bg-zinc-200 transition-all font-headline font-bold text-zinc-400">
                  {session?.user?.name?.[0] || session?.user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 font-body">Full Name</label>
                  <input className="w-full bg-zinc-50 border-transparent border-2 focus:border-primary/20 rounded-xl px-4 py-3 outline-none transition-all" type="text" defaultValue={session?.user?.name || ''} placeholder="Add your name" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 font-body">Email</label>
                  <input className="w-full bg-zinc-100 border-none rounded-xl px-4 py-3 text-zinc-400 cursor-not-allowed" type="email" defaultValue={session?.user?.email || ''} readOnly />
                </div>
              </div>
            </div>
            <div className="mt-10 flex justify-end">
              <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95">Save Changes</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-10 shadow-sm border border-zinc-100 mt-8">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2 font-headline tracking-tighter uppercase">Admin Management</h2>
            <p className="text-zinc-500 mb-8 font-body">Create new administrator accounts. Only current admins can perform this action.</p>

            {adminError && (
              <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {adminError}
              </div>
            )}

            {adminSuccess && (
              <div className="mb-6 bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                {adminSuccess}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 font-body">Full Name</label>
                  <input name="name" required disabled={isAdminLoading} className="w-full bg-zinc-50 border-transparent border-2 focus:border-primary/20 rounded-xl px-4 py-3 font-body outline-none transition-all" type="text" placeholder="Lycoris" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 font-body">Email</label>
                  <input name="email" required disabled={isAdminLoading} className="w-full bg-zinc-50 border-transparent border-2 focus:border-primary/20 rounded-xl px-4 py-3 font-body outline-none transition-all" type="email" placeholder="admin@company.com" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 font-body">Temporary Password</label>
                  <input name="password" required disabled={isAdminLoading} className="w-full bg-zinc-50 border-transparent border-2 focus:border-primary/20 rounded-xl px-4 py-3 font-body outline-none transition-all" type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isAdminLoading}
                  className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isAdminLoading && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isAdminLoading ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>

        </section>
      </main>
    </div>
  );
}
