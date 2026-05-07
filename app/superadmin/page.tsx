
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProjectInfo {
  _id: string;
  name: string;
  status: string;
  theme: string;
  updatedAt: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function SuperAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters & UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session && (session.user as any).role !== 'superadmin') {
      setError('Access Denied: You do not have superadmin privileges.');
      setLoading(false);
    } else if (session && (session.user as any).role === 'superadmin') {
      fetchProjects();
    }
  }, [session, status, router]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects?limit=500'); // Higher limit for admin
      const data = await res.json();
      if (res.ok) {
        setProjects(data.projects);
      } else {
        setError(data.error || 'Failed to fetch projects');
      }
    } catch (err) {
      setError('An error occurred while fetching projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter(p => p._id !== id));
      } else {
        alert('Failed to delete project');
      }
    } catch (err) {
      alert('Error deleting project');
    }
  };

  // Memoized Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  // Memoized Grouped Projects
  const groupedProjects = useMemo(() => {
    const groups: Record<string, { user: ProjectInfo['userId'], projects: ProjectInfo[] }> = {};
    filteredProjects.forEach(p => {
      const uid = p.userId?._id || 'unknown';
      if (!groups[uid]) {
        groups[uid] = { user: p.userId, projects: [] };
      }
      groups[uid].projects.push(p);
    });
    return Object.values(groups);
  }, [filteredProjects]);

  // Stats
  const stats = useMemo(() => ({
    total: projects.length,
    published: projects.filter(p => p.status === 'published').length,
    users: new Set(projects.map(p => p.userId?._id)).size
  }), [projects]);

  if (status === 'loading' || (loading && projects.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Mastering Records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-[2rem] shadow-2xl max-w-md w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <i className="fa-solid fa-shield-halved text-3xl"></i>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Restricted Access</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-10">{error}</p>
          <Link href="/dashboard" className="inline-block w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6 lg:px-12">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-16">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">System Master</div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">Control Panel</h1>
            <p className="text-gray-400 font-medium text-lg">Centralized oversight for all platform assets and users.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Total Projects', value: stats.total, icon: 'fa-layer-group', color: 'blue' },
              { label: 'Published', value: stats.published, icon: 'fa-globe', color: 'emerald' },
              { label: 'Active Users', value: stats.users, icon: 'fa-users', color: 'purple' }
            ].map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm min-w-[180px]">
                <div className={`w-10 h-10 rounded-2xl bg-${s.color}-50 flex items-center justify-center text-${s.color}-600 mb-4`}>
                  <i className={`fa-solid ${s.icon}`}></i>
                </div>
                <div className="text-2xl font-black text-gray-900 leading-none mb-1">{s.value}</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4 mb-8">
          <div className="relative flex-1 group">
            <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"></i>
            <input 
              type="text" 
              placeholder="Search by project name, user name, or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-3 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
            {(['all', 'published', 'draft'] as const).map(s => (
              <button 
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
            <button 
              onClick={() => setViewMode('list')}
              className={`w-12 h-10 flex items-center justify-center rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              title="List View"
            >
              <i className="fa-solid fa-list-ul"></i>
            </button>
            <button 
              onClick={() => setViewMode('grouped')}
              className={`w-12 h-10 flex items-center justify-center rounded-xl transition-all ${viewMode === 'grouped' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              title="Group by User"
            >
              <i className="fa-solid fa-user-group text-xs"></i>
            </button>
          </div>
          <button 
            onClick={fetchProjects}
            disabled={loading}
            className="w-12 h-12 flex items-center justify-center bg-gray-900 text-white rounded-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
          >
            <i className={`fa-solid fa-rotate-right ${loading ? 'animate-spin' : ''}`}></i>
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {viewMode === 'list' ? (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-50">
                    <th className="pl-10 pr-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Project Information</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Authorized Owner</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Deployment Status</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Design Theme</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Mod Date</th>
                    <th className="pl-6 pr-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProjects.map((project) => (
                    <tr key={project._id} className="hover:bg-blue-50/20 transition-all group">
                      <td className="pl-10 pr-6 py-7">
                        <div className="flex flex-col">
                          <span className="font-black text-gray-900 text-lg tracking-tight group-hover:text-blue-600 transition-colors" dangerouslySetInnerHTML={{ __html: project.name }}></span>
                          <span className="text-[10px] text-gray-300 font-mono mt-1.5 uppercase tracking-widest">{project._id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-7">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">
                            {project.userId?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800 leading-tight">{project.userId?.name || 'Unknown User'}</span>
                            <span className="text-xs text-gray-400 mt-0.5">{project.userId?.email || 'no-email@system'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-7">
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] ${
                          project.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${project.status === 'published' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></div>
                          {project.status}
                        </div>
                      </td>
                      <td className="px-6 py-7">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                          {project.theme}
                        </span>
                      </td>
                      <td className="px-6 py-7 text-xs font-bold text-gray-400">
                        {new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="pl-6 pr-10 py-7 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <Link 
                            href={`/editor/${project._id}`} 
                            className="w-10 h-10 bg-white border border-gray-100 text-gray-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm hover:shadow-lg"
                            title="Master Edit"
                          >
                            <i className="fa-solid fa-pen-nib text-sm"></i>
                          </Link>
                          <button 
                            onClick={() => handleDelete(project._id)} 
                            className="w-10 h-10 bg-white border border-gray-100 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm hover:shadow-lg"
                            title="Delete Permanently"
                          >
                            <i className="fa-solid fa-trash-can text-sm"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProjects.length === 0 && (
                <div className="py-32 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                    <i className="fa-solid fa-magnifying-glass text-3xl"></i>
                  </div>
                  <h3 className="text-gray-900 font-black text-xl uppercase tracking-tight">No results found</h3>
                  <p className="text-gray-400 mt-2">Try adjusting your filters or search query.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
              {groupedProjects.map((group) => (
                <div key={group.user?._id || 'unknown'} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col group/user">
                  {/* User Card Header */}
                  <div className="p-8 bg-gray-50/50 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                        {group.user?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Project Count</div>
                        <div className="text-2xl font-black text-gray-900 leading-none">{group.projects.length}</div>
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 truncate tracking-tight">{group.user?.name || 'Unknown User'}</h3>
                    <p className="text-sm text-gray-400 truncate mt-1">{group.user?.email || 'no-email@system'}</p>
                  </div>
                  
                  {/* User Projects List */}
                  <div className="flex-1 p-6 space-y-3 overflow-y-auto max-h-[400px] custom-scrollbar">
                    {group.projects.map(p => (
                      <div key={p._id} className="flex items-center justify-between p-4 bg-white border border-gray-50 rounded-2xl hover:border-blue-100 hover:shadow-sm transition-all group/p">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="font-bold text-gray-800 text-sm truncate" dangerouslySetInnerHTML={{ __html: p.name }}></div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[8px] font-black uppercase tracking-widest ${p.status === 'published' ? 'text-emerald-500' : 'text-gray-300'}`}>
                              {p.status}
                            </span>
                            <span className="text-[8px] text-gray-300">•</span>
                            <span className="text-[8px] text-gray-300 font-mono uppercase">{p._id.slice(-6)}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover/p:opacity-100 transition-opacity">
                          <Link href={`/editor/${p._id}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                            <i className="fa-solid fa-pen-nib text-[10px]"></i>
                          </Link>
                          <button onClick={() => handleDelete(p._id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white transition-all">
                            <i className="fa-solid fa-trash-can text-[10px]"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {groupedProjects.length === 0 && (
                <div className="col-span-full py-32 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                    <i className="fa-solid fa-user-group text-3xl"></i>
                  </div>
                  <h3 className="text-gray-900 font-black text-xl uppercase tracking-tight">No groups found</h3>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
