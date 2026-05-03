'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TopNavBar } from '@/components/TopNavBar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';


export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ projectCount: 0, publishedCount: 0, userCount: 0, chartData: [] });
  const [activeRange, setActiveRange] = useState("7d");
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch(`/api/admin/analytics?range=${activeRange}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setStats(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session, activeRange]);


  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-body">
      <TopNavBar userEmail={session?.user?.email} />
      <main className="pt-16 pb-12 px-8 max-w-screen-2xl mx-auto flex gap-8">
        <aside className="hidden lg:flex h-[calc(100vh-140px)] w-64 sticky top-28 flex-col p-6 gap-y-4 bg-white border border-zinc-100 font-manrope text-sm rounded-md">
          <nav className="flex flex-col gap-1">
            <a className="flex items-center gap-3 p-3 text-zinc-900 font-semibold bg-zinc-50 rounded-md" href="#">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              Overview
            </a>
          </nav>
        </aside>

        <section className="flex-1">
          <header className="mb-12 flex justify-between items-end">
            <div>
              <label className="text-primary font-bold tracking-widest text-[10px] uppercase block mb-2">Real-time Performance</label>
              <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-zinc-900">Conversion Engine</h1>
            </div>

            <div className="flex gap-3 bg-white p-1.5 rounded-md shadow-sm border border-zinc-100">
              <button onClick={() => setActiveRange('24h')} className={`px-4 py-1.5 rounded-md text-xs font-bold ${activeRange === '24h' ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>24H</button>
              <button onClick={() => setActiveRange('7d')} className={`px-4 py-1.5 rounded-md text-xs font-bold ${activeRange === '7d' ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>7D</button>
              <button onClick={() => setActiveRange('30d')} className={`px-4 py-1.5 rounded-md text-xs font-bold ${activeRange === '30d' ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>30D</button>
            </div>

          </header>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-md shadow-sm border border-zinc-100">
              <h3 className="text-xs uppercase font-bold text-zinc-400 mb-2">Total Projects</h3>
              <p className="text-5xl font-headline font-extrabold text-zinc-900">{loading ? '...' : stats.projectCount}</p>
              <p className="text-lime-600 font-bold text-xs mt-4">Drafts + Published</p>
            </div>
            <div className="bg-white p-8 rounded-md shadow-sm border border-zinc-100">
              <h3 className="text-xs uppercase font-bold text-zinc-400 mb-2">Published Sites</h3>
              <p className="text-5xl font-headline font-extrabold text-zinc-900">{loading ? '...' : stats.publishedCount}</p>
              <p className="text-lime-600 font-bold text-xs mt-4">Live on the web</p>
            </div>
            <div className="bg-primary p-8 rounded-md shadow-lg shadow-primary/20 text-white">
              <h3 className="text-xs uppercase font-bold opacity-80 mb-2 font-headline">Total Users/Admins</h3>
              <p className="text-5xl font-headline font-extrabold">{loading ? '...' : stats.userCount}</p>
              <p className="text-white/80 font-bold text-xs mt-4">System members</p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-md shadow-sm border border-zinc-100">
              <h3 className="text-xs uppercase font-bold text-zinc-400 mb-6 tracking-widest">Projects Created</h3>
              <div className="h-72 w-full">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a1a1aa' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a1a1aa' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: '#18181b', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="projects" stroke="#84cc16" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-md shadow-sm border border-zinc-100">
              <h3 className="text-xs uppercase font-bold text-zinc-400 mb-6 tracking-widest">Projects Published</h3>
              <div className="h-72 w-full">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a1a1aa' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a1a1aa' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: '#18181b', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="published" fill="#18181b" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
