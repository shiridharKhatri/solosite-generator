'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TopNavBar } from '@/components/TopNavBar';

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterStatus = searchParams.get('status');
  const [projects, setProjects] = useState<any[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    setCurrentPage(page);
    
    const url = new URL('/api/projects', window.location.origin);
    if (filterStatus) url.searchParams.set('status', filterStatus);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', itemsPerPage.toString());

    if (status === 'authenticated') {
      setIsProjectsLoading(true);
      fetch(url.toString())
        .then(async res => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Request failed with status ${res.status}: ${text}`);
          }
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return res.json();
          }
          throw new Error("Response is not JSON");
        })
        .then(data => {
          if (data && Array.isArray(data.projects)) {
            setProjects(data.projects);
            setTotalPages(data.totalPages || 1);
            setTotalCount(data.total || 0);
          } else {
            setProjects([]);
            setTotalPages(1);
            setTotalCount(0);
          }
        })
        .catch(err => {
          setProjects([]);
        })
        .finally(() => {
          setIsProjectsLoading(false);
        });
    }
  }, [status, filterStatus, searchParams]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/dashboard?${params.toString()}`);
  };

  const deleteProject = React.useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p._id !== id));
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        setTotalCount(prev => prev - 1);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete');
      }
    } catch (error) {
      // Silently fail or use a toast in production
    }
  }, []);

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} projects?`)) return;

    try {
      const res = await fetch(`/api/projects?ids=${selectedIds.join(',')}`, { method: 'DELETE' });
      if (res.ok) {
        const deletedCount = selectedIds.length;
        setProjects(prev => prev.filter(p => !selectedIds.includes(p._id)));
        setSelectedIds([]);
        setTotalCount(prev => prev - deletedCount);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete selected projects');
      }
    } catch (error) {
      alert('An error occurred while deleting projects');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === projects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(projects.map(p => p._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };


  if (status === 'loading') return <div className="p-10 text-zinc-900">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-body">
      <TopNavBar userEmail={session?.user?.email} />

      <main className="max-w-[1440px] mx-auto pt-16 pb-12 px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-zinc-900 leading-tight">Recent Projects</h1>
              <span className="bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full text-sm font-bold mt-2">
                {totalCount}
              </span>
            </div>
            <p className="text-zinc-500 font-body text-lg max-w-md">Continue building your digital experiences or start a new architectural journey.</p>
          </div>
          <div className="flex flex-col gap-4 items-end">
            {selectedIds.length > 0 && (
              <button
                onClick={deleteSelected}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg font-bold text-sm hover:bg-rose-600 transition-all shadow-lg shadow-rose-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete {selectedIds.length} Selected
              </button>
            )}
            <div className="flex gap-3">
              <div className="flex items-center gap-3 mr-4">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={projects.length > 0 && selectedIds.length === projects.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="selectAll" className="text-sm font-bold text-zinc-600 cursor-pointer">Select All</label>
              </div>
              <div className="flex bg-white rounded-md p-1 border border-zinc-200">
                <button
                  onClick={() => router.push('/dashboard')}
                  className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${!filterStatus ? 'bg-primary text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
                >
                  All
                </button>
                <button
                  onClick={() => router.push('/dashboard?status=published')}
                  className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${filterStatus === 'published' ? 'bg-primary text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
                >
                  Published
                </button>
                <button
                  onClick={() => router.push('/dashboard?status=draft')}
                  className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${filterStatus === 'draft' ? 'bg-primary text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
                >
                  Drafts
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isProjectsLoading ? (
            <>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden border border-zinc-100 shadow-sm animate-pulse">
                  <div className="aspect-[16/10] bg-zinc-100"></div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between">
                      <div className="h-6 bg-zinc-100 rounded-md w-1/2"></div>
                      <div className="h-5 bg-zinc-100 rounded-md w-1/4"></div>
                    </div>
                    <div className="h-3 bg-zinc-50 rounded-md w-1/3"></div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            projects.map((project) => (
              <div
                key={project._id}
                className={`group relative flex flex-col bg-white rounded-2xl transition-all duration-500 border ${selectedIds.includes(project._id) ? 'border-primary shadow-[0_0_0_2px_rgba(101,163,13,0.1)]' : 'border-zinc-200/60'} hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 min-h-[160px] justify-center overflow-hidden`}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-4 right-4 z-20">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(project._id)}
                    onChange={() => toggleSelect(project._id)}
                    className="w-5 h-5 rounded border-zinc-300 text-primary focus:ring-primary cursor-pointer transition-transform hover:scale-110"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Status Indicator Bar */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${project.status === 'published' ? 'bg-emerald-400' : 'bg-amber-400'}`} />

                <div className="flex justify-between items-center mb-4">
                  <div className="space-y-1">
                    <h3 className="font-headline text-2xl font-bold text-zinc-900 tracking-tight leading-none group-hover:text-primary transition-colors duration-300">
                      {project.name ? project.name.replace(/<[^>]*>/g, '') : 'Untitled Project'}
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-[10px] uppercase font-bold tracking-widest leading-none">Last edited {new Date(project.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="h-3 w-px bg-zinc-200"></div>
                      <div className="flex items-center gap-1.5">
                        <i className={`fa-solid ${project.theme === 'organic' ? 'fa-leaf text-emerald-500' : 'fa-cube text-blue-500'} text-[10px]`}></i>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{project.theme || 'Classic'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${project.status === 'published' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      {project.status || 'draft'}
                    </span>
                    <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-zinc-50 border border-zinc-100">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">SEO</span>
                      <span className={`text-[10px] font-bold ${project.seoScore >= 80 ? 'text-emerald-500' : project.seoScore >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {project.seoScore || 0}%
                      </span>
                    </div>

                  </div>
                </div>

                {/* Subtle Geometric Background Element */}
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 pointer-events-none">
                  <svg className="w-32 h-32" viewBox="0 0 100 100" fill="currentColor">
                    <circle cx="50" cy="50" r="50" />
                  </svg>
                </div>

                {/* Refined Action Overlay */}
                <div className="absolute inset-0 bg-zinc-900/5 backdrop-blur-[1px] flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Link
                    href={`/editor/${project._id}`}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/25"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Edit Project
                  </Link>
                  <button
                    onClick={() => deleteProject(project._id)}
                    className="w-11 h-11 rounded-xl bg-white text-rose-500 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all shadow-lg border border-zinc-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))
          )}


        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-600 font-bold text-sm hover:bg-zinc-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                // Only show a few page numbers around current page
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                        currentPage === page 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                          : 'bg-white border border-zinc-200 text-zinc-500 hover:border-primary/40 hover:text-primary'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 || 
                  page === currentPage + 2
                ) {
                  return <span key={page} className="text-zinc-400">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-600 font-bold text-sm hover:bg-zinc-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <TopNavBar />
      <main className="max-w-[1440px] mx-auto pt-16 pb-12 px-8">
        <div className="h-12 w-64 bg-zinc-100 rounded-lg animate-pulse mb-12"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden border border-zinc-100 animate-pulse">
              <div className="aspect-[16/10] bg-zinc-100"></div>
              <div className="p-6 space-y-4">
                <div className="h-6 bg-zinc-100 rounded-md w-1/2"></div>
                <div className="h-3 bg-zinc-50 rounded-md w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
