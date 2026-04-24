'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { TopNavBar } from '@/components/TopNavBar';

export default function TemplatesPage() {
  const { data: session } = useSession();
  const [activeFilter, setActiveFilter] = useState("ALL TEMPLATES");

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-body">
      <TopNavBar userEmail={session?.user?.email} />
      <main className="pt-16 pb-20 px-8 max-w-screen-2xl mx-auto">
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <span className="font-label text-xs font-bold uppercase tracking-widest text-primary mb-4 block">Design Library</span>
              <h1 className="font-headline text-6xl md:text-7xl font-semibold tracking-tighter leading-tight text-on-background mb-8">
                The Canvas for <br /><span className="text-primary italic">High-Growth</span> Brands.
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {['ALL TEMPLATES', 'E-COMMERCE'].includes(activeFilter) && (
          <div className="group relative overflow-hidden rounded-xl bg-white transition-all hover:shadow-2xl border border-zinc-100 flex flex-col cursor-pointer" onClick={() => window.location.href = '/editor/new?layout=default'}>
            <div className="aspect-[16/9] w-full relative bg-zinc-50 flex items-center justify-center border-b border-zinc-100 p-8">
              <div className="w-full h-full bg-white shadow-sm border border-zinc-200 rounded-lg flex flex-col">
                <div className="h-12 border-b flex items-center px-4"><div className="w-8 h-8 rounded-full bg-blue-100"></div><div className="ml-auto w-24 h-8 bg-blue-600 rounded-full"></div></div>
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                  <h1 className="text-3xl font-bold mb-2">Glycopezil Core</h1>
                  <p className="text-sm text-zinc-400">High-converting default layout</p>
                </div>
              </div>
            </div>
            <div className="p-8 flex justify-between items-center">
              <div>
                <h3 className="font-headline text-2xl font-bold mb-1">Glycopezil Core</h3>
                <p className="text-zinc-500">The battle-tested supplement sales page layout.</p>
              </div>
              <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold">DEFAULT</span>
            </div>
          </div>

          )}
          {['ALL TEMPLATES', 'SAAS'].includes(activeFilter) && (
          <div className="group relative overflow-hidden rounded-xl bg-white transition-all hover:shadow-2xl border border-zinc-100 flex flex-col cursor-pointer" onClick={() => window.location.href = '/editor/new?layout=modern'}>
            <div className="aspect-[16/9] w-full relative bg-zinc-900 flex items-center justify-center border-b border-zinc-800 p-8">
              <div className="w-full h-full bg-black shadow-lg border border-zinc-800 rounded-lg flex flex-col text-white">
                <div className="h-12 border-b border-zinc-800 flex items-center px-4"><div className="w-8 h-8 rounded-md bg-zinc-800"></div><div className="ml-auto w-24 h-8 bg-white text-black rounded-full text-xs flex items-center justify-center">Start</div></div>
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                  <h1 className="text-3xl font-bold mb-2">Modern Minimal</h1>
                  <p className="text-sm text-zinc-500">Dark mode premium aesthetic</p>
                </div>
              </div>
            </div>
            <div className="p-8 flex justify-between items-center">
              <div>
                <h3 className="font-headline text-2xl font-bold mb-1">Modern Minimal</h3>
                <p className="text-zinc-500">Dark theme, high contrast, perfect for luxury brands.</p>
              </div>
            </div>
          </div>

          )}
          {['ALL TEMPLATES', 'EDITORIAL'].includes(activeFilter) && (
          <div className="group relative overflow-hidden rounded-xl bg-white transition-all hover:shadow-2xl border border-zinc-100 flex flex-col cursor-pointer" onClick={() => window.location.href = '/editor/new?layout=clinical'}>
            <div className="aspect-[16/9] w-full relative bg-blue-50 flex items-center justify-center border-b border-blue-100 p-8">
              <div className="w-full h-full bg-white shadow-sm border border-blue-100 rounded-lg flex flex-col">
                <div className="h-12 border-b border-blue-50 flex items-center px-4"><div className="text-blue-600 font-bold">LOGO</div><div className="ml-auto w-24 h-8 bg-blue-600 rounded-md"></div></div>
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                  <h1 className="text-2xl font-bold text-blue-900 mb-2">Clinical Science</h1>
                  <p className="text-sm text-blue-400">Medical-grade trust layout</p>
                </div>
              </div>
            </div>
            <div className="p-8 flex justify-between items-center">
              <div>
                <h3 className="font-headline text-2xl font-bold mb-1">Clinical Science</h3>
                <p className="text-zinc-500">Builds trust with a medical, clean, professional look.</p>
              </div>
            </div>
          </div>

          )}
          {['ALL TEMPLATES', 'E-COMMERCE'].includes(activeFilter) && (
          <div className="group relative overflow-hidden rounded-xl bg-white transition-all hover:shadow-2xl border border-zinc-100 flex flex-col cursor-pointer" onClick={() => window.location.href = '/editor/new?layout=organic'}>
            <div className="aspect-[16/9] w-full relative bg-[#F0EBE1] flex items-center justify-center border-b border-[#E6D5C3] p-8">
              <div className="w-full h-full bg-[#FAF6ED] shadow-sm border border-[#E6D5C3] rounded-lg flex flex-col">
                <div className="h-12 flex items-center px-4"><div className="w-6 h-6 rounded-full bg-green-800"></div><div className="ml-auto w-24 h-8 bg-amber-600 rounded-full"></div></div>
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                  <h1 className="text-2xl font-serif text-[#4A3320] mb-2">Earth Organic</h1>
                  <p className="text-sm text-[#6A5949]">Natural, holistic layout</p>
                </div>
              </div>
            </div>
            <div className="p-8 flex justify-between items-center">
              <div>
                <h3 className="font-headline text-2xl font-bold mb-1">Earth Organic</h3>
                <p className="text-zinc-500">Soft colors, serif fonts, perfect for natural supplements.</p>
              </div>
            </div>
          </div>
          )}
        </div>

      </main>
    </div>
  );
}
