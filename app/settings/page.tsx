'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { TopNavBar } from '@/components/TopNavBar';

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-body">
      <TopNavBar userEmail={session?.user?.email} />
      <main className="pt-32 pb-20 px-8 max-w-screen-2xl mx-auto flex flex-col md:flex-row gap-16 font-body">
        <aside className="hidden md:flex flex-col w-64 sticky top-32 h-fit gap-y-2">
           <div className="p-6 bg-zinc-50 rounded-xl mb-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-lime-500 rounded-lg flex items-center justify-center">
                    <span className="text-white">⭐</span>
                 </div>
                 <div>
                    <p className="text-sm font-bold text-zinc-900">Elite Member</p>
                    <p className="text-[10px] text-lime-600 font-bold uppercase tracking-wider">Pro Plan</p>
                 </div>
              </div>
           </div>
           <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-900 font-semibold bg-white rounded-xl shadow-sm border border-zinc-100">👤 Profile</button>
           <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-primary">💳 Billing</button>
           <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-primary">🛡️ Security</button>
           <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all">🚪 Sign Out</button>
        </aside>

        <section className="flex-1 space-y-12">
           <header>
              <h1 className="text-5xl font-extrabold tracking-tighter text-zinc-900 mb-4 font-headline uppercase leading-none">Account Settings</h1>
              <p className="text-zinc-500 text-lg max-w-2xl">Manage your editorial profile and subscription details.</p>
           </header>

           <div className="bg-white rounded-xl p-10 shadow-sm border border-zinc-100">
              <h2 className="text-2xl font-bold text-zinc-900 mb-8 font-headline tracking-tighter uppercase">Profile Identity</h2>
              <div className="flex items-start gap-12">
                 <div className="relative group cursor-pointer w-32 h-32 flex-shrink-0">
                    <div className="w-full h-full rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-4xl shadow-lg group-hover:bg-zinc-200 transition-all">
                       {session?.user?.name?.[0] || 'U'}
                    </div>
                 </div>
                 <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="block text-[10px] font-bold uppercase text-zinc-400 font-body">Full Name</label>
                       <input className="w-full bg-zinc-50 border-none rounded-md px-4 py-3" type="text" defaultValue={session?.user?.name || ''} />
                    </div>
                    <div className="space-y-2">
                       <label className="block text-[10px] font-bold uppercase text-zinc-400 font-body">Email</label>
                       <input className="w-full bg-zinc-50 border-none rounded-md px-4 py-3" type="email" defaultValue={session?.user?.email || ''} readOnly />
                    </div>
                 </div>
              </div>
              <div className="mt-10 flex justify-end">
                 <button className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95">Save Changes</button>
              </div>
           </div>

           <div className="bg-zinc-900 rounded-xl p-10 text-white flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                 <span className="bg-lime-500/20 text-lime-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-4 inline-block font-body">Active Plan</span>
                 <h3 className="text-4xl font-extrabold font-headline uppercase tracking-tighter">Editorial Pro</h3>
                 <p className="text-zinc-400 mt-2 font-body">$49/mo • Next bill: April 24, 2026</p>
              </div>
              <button className="bg-white text-zinc-900 px-8 py-4 rounded-full font-bold shadow-lg hover:bg-zinc-200 transition-all active:scale-95 text-sm uppercase tracking-wider">Manage Billing</button>
           </div>
        </section>
      </main>
    </div>
  );
}
