'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopNavBar } from '@/components/TopNavBar';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentStatus = params.get('status');
    const url = currentStatus ? `/api/projects?status=${currentStatus}` : '/api/projects';
    
    if (status === 'authenticated') {
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setProjects(data);
          } else {
            setProjects([]);
          }
        })
        .catch(err => {
          console.error("Failed to fetch projects:", err);
          setProjects([]);
        });
    }
  }, [status, router]); // Added router to re-fetch on status param change

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p._id !== id));
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };


  if (status === 'loading') return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-body">
      <TopNavBar userEmail={session?.user?.email} />

      <main className="max-w-[1440px] mx-auto pt-16 pb-12 px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-zinc-900 leading-tight">Recent Projects</h1>
            <p className="text-zinc-500 font-body text-lg max-w-md">Continue building your digital experiences or start a new architectural journey.</p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-white rounded-full p-1 border border-zinc-200">
              <button 
                onClick={() => router.push('/dashboard')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!new URLSearchParams(window.location.search).get('status') ? 'bg-primary text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                All
              </button>
              <button 
                onClick={() => router.push('/dashboard?status=published')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${new URLSearchParams(window.location.search).get('status') === 'published' ? 'bg-primary text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                Published
              </button>
              <button 
                onClick={() => router.push('/dashboard?status=draft')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${new URLSearchParams(window.location.search).get('status') === 'draft' ? 'bg-primary text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                Drafts
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div key={project._id} className="group relative flex flex-col bg-white rounded-[1.5rem] overflow-hidden transition-all duration-300 card-shadow hover-card-shadow border border-zinc-100/50">
              <div className="aspect-[16/10] overflow-hidden relative bg-zinc-50">
                <div className="w-full h-full flex items-center justify-center text-zinc-200">
                  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link href={`/editor/${project._id}`} className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </Link>
                  <button 
                    onClick={() => deleteProject(project._id)}
                    className="w-12 h-12 rounded-full bg-white text-rose-500 flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-zinc-200/50"
                  >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-headline text-xl font-bold text-zinc-900">{project.name}</h3>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${project.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {project.status || 'draft'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                   <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-zinc-500 font-body text-[11px] uppercase font-bold tracking-wider leading-none">Edited {new Date(project.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}

          <Link href="/editor/new" className="group relative flex flex-col border-2 border-dashed border-zinc-200 rounded-[1.5rem] aspect-[16/10] items-center justify-center hover:border-primary/50 hover:bg-zinc-50 transition-all duration-300 cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
               <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
            <p className="font-headline text-lg font-bold text-zinc-900">Create New Page</p>
            <p className="text-zinc-500 font-body text-sm">Start from a blank canvas</p>
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-zinc-900 text-white rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between overflow-hidden relative shadow-2xl">
            <div className="relative z-10 max-w-sm">
              <h2 className="font-headline text-3xl font-bold mb-4">Master the Craft</h2>
              <p className="text-zinc-400 font-body mb-8">Learn how to build faster with our advanced grid systems and responsive workflow tutorials.</p>
              <button className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary-dim transition-all shadow-lg shadow-primary/20">
                View Tutorials
              </button>
            </div>
            <div className="w-1/3 opacity-40 -rotate-12 translate-x-4 hidden md:block">
              <div className="w-full aspect-square bg-gradient-to-br from-primary to-primary-dim rounded-3xl" />
            </div>
          </div>
          <div className="bg-lime-50 rounded-[2.5rem] p-10 border border-lime-200 lg:min-h-[300px] flex flex-col">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-6 text-white text-xl">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="font-headline text-xl font-bold mb-2 text-zinc-900">New: AI Layouts</h3>
            <p className="text-zinc-600 text-sm leading-relaxed font-body">Describe your project and let our AI architect build the foundation for you. Now in beta for all Pro users.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
