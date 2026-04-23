'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { TopNavBar } from '@/components/TopNavBar';

export default function AnalyticsPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-body">
      <TopNavBar userEmail={session?.user?.email} />
      <main className="pt-28 pb-12 px-8 max-w-screen-2xl mx-auto flex gap-8">
        <aside className="hidden lg:flex h-[calc(100vh-140px)] w-64 sticky top-28 flex-col p-6 gap-y-4 bg-white border border-zinc-100 font-manrope text-sm rounded-xl">
          <nav className="flex flex-col gap-1">
            <a className="flex items-center gap-3 p-3 text-zinc-900 font-semibold bg-zinc-50 rounded-xl" href="#"><span className="text-primary text-lg">📊</span> Overview</a>
            <a className="flex items-center gap-3 p-3 text-zinc-500 hover:text-primary" href="#"><span className="text-lg">📈</span> Insights</a>
            <a className="flex items-center gap-3 p-3 text-zinc-500 hover:text-primary" href="#"><span className="text-lg">👥</span> Team</a>
          </nav>
        </aside>

        <section className="flex-1">
          <header className="mb-12 flex justify-between items-end">
            <div>
              <label className="text-primary font-bold tracking-widest text-[10px] uppercase block mb-2">Real-time Performance</label>
              <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-zinc-900">Conversion Engine</h1>
            </div>
            <div className="flex gap-3 bg-white p-1.5 rounded-xl shadow-sm border border-zinc-100">
               <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 text-white">24H</button>
               <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-zinc-500">7D</button>
               <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-zinc-500">30D</button>
            </div>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-100">
                <h3 className="text-xs uppercase font-bold text-zinc-400 mb-2">Unique Visitors</h3>
                <p className="text-5xl font-headline font-extrabold text-zinc-900">14,282</p>
                <p className="text-lime-600 font-bold text-xs mt-4">↑ 12.4% vs last week</p>
             </div>
             <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-100">
                <h3 className="text-xs uppercase font-bold text-zinc-400 mb-2">Conversion Rate</h3>
                <p className="text-5xl font-headline font-extrabold text-zinc-900">4.82%</p>
                <p className="text-lime-600 font-bold text-xs mt-4">↑ 0.6% vs last week</p>
             </div>
             <div className="bg-primary p-8 rounded-xl shadow-lg shadow-primary/20 text-white">
                <h3 className="text-xs uppercase font-bold opacity-80 mb-2 font-headline">Total Leads</h3>
                <p className="text-5xl font-headline font-extrabold">688</p>
                <p className="text-white/80 font-bold text-xs mt-4">Real-time update</p>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}
