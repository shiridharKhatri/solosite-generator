'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { TopNavBar } from '@/components/TopNavBar';

export default function TemplatesPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-body">
      <TopNavBar userEmail={session?.user?.email} />
      <main className="pt-32 pb-20 px-8 max-w-screen-2xl mx-auto">
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <span className="font-label text-xs font-bold uppercase tracking-widest text-primary mb-4 block">Design Library</span>
              <h1 className="font-headline text-6xl md:text-7xl font-semibold tracking-tighter leading-tight text-on-background mb-8">
                The Canvas for <br/><span className="text-primary italic">High-Growth</span> Brands.
              </h1>
              <p className="text-xl text-zinc-500 max-w-lg leading-relaxed">
                Precision-engineered templates designed for performance. Start with the architecture of success and customize to your vision.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-start lg:justify-end pb-2">
              {['ALL TEMPLATES', 'SAAS', 'PORTFOLIO', 'E-COMMERCE', 'EDITORIAL'].map(cat => (
                <button key={cat} className="px-6 py-2 rounded-full bg-white text-on-surface font-label text-sm font-bold shadow-sm border border-outline hover:bg-primary hover:text-white transition-all">
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 group relative overflow-hidden rounded-xl bg-white transition-all hover:shadow-2xl border border-zinc-100">
            <div className="aspect-[16/9] w-full relative bg-zinc-50 flex items-center justify-center text-zinc-200 uppercase font-bold text-4xl">
              SaaS Template
            </div>
            <div className="p-10 flex justify-between items-center">
              <div>
                <h3 className="font-headline text-2xl font-bold mb-1">Aura Platform</h3>
                <p className="text-zinc-500">High-conversion landing page for Fintech SaaS.</p>
              </div>
              <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold">NEW</span>
            </div>
          </div>
          <div className="md:col-span-4 group relative overflow-hidden rounded-xl bg-white transition-all hover:shadow-2xl border border-zinc-100">
            <div className="aspect-[4/5] w-full relative bg-zinc-50 flex items-center justify-center text-zinc-200 uppercase font-bold text-2xl">
              Portfolio
            </div>
            <div className="p-8">
              <h3 className="font-headline text-xl font-bold">Kinetik Portfolio</h3>
              <p className="text-zinc-500 text-sm">Visual-first layout for creative directors.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
