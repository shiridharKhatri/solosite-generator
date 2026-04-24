'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { TopNavBar } from '@/components/TopNavBar';

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-body">
      <TopNavBar userEmail={session?.user?.email} />
      <main className="pt-16 pb-20 px-8 max-w-screen-2xl mx-auto flex flex-col md:flex-row gap-16 font-body">
        
        <aside className="hidden md:flex flex-col w-64 sticky top-32 h-fit gap-y-2">
           <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-900 font-semibold bg-white rounded-xl shadow-sm border border-zinc-100">
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

           <div className="bg-white rounded-xl p-10 shadow-sm border border-zinc-100 mt-8">
              <h2 className="text-2xl font-bold text-zinc-900 mb-2 font-headline tracking-tighter uppercase">Admin Management</h2>
              <p className="text-zinc-500 mb-8 font-body">Create new administrator accounts. Only current admins can perform this action.</p>
              
              <form onSubmit={async (e) => {
                 e.preventDefault();
                 const formData = new FormData(e.currentTarget);
                 const res = await fetch('/api/admin/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(Object.fromEntries(formData))
                 });
                 if (res.ok) {
                    alert('Admin created successfully!');
                    (e.target as HTMLFormElement).reset();
                 } else {
                    const data = await res.json();
                    alert(data.error || 'Failed to create admin');
                 }
              }} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="block text-[10px] font-bold uppercase text-zinc-400 font-body">Full Name</label>
                       <input name="name" required className="w-full bg-zinc-50 border-none rounded-md px-4 py-3 font-body focus:ring-2 focus:ring-primary outline-none transition-all" type="text" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                       <label className="block text-[10px] font-bold uppercase text-zinc-400 font-body">Email</label>
                       <input name="email" required className="w-full bg-zinc-50 border-none rounded-md px-4 py-3 font-body focus:ring-2 focus:ring-primary outline-none transition-all" type="email" placeholder="admin@company.com" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <label className="block text-[10px] font-bold uppercase text-zinc-400 font-body">Temporary Password</label>
                       <input name="password" required className="w-full bg-zinc-50 border-none rounded-md px-4 py-3 font-body focus:ring-2 focus:ring-primary outline-none transition-all" type="password" placeholder="••••••••" />
                    </div>
                 </div>
                 <div className="mt-6 flex justify-end">
                    <button type="submit" className="bg-zinc-900 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-zinc-800 transition-all active:scale-95">Create Admin</button>
                 </div>
              </form>
           </div>

           </section>
      </main>
    </div>
  );
}
