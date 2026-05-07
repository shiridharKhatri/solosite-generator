
'use client';

import React, { useEffect, useState } from 'react';
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
    try {
      const res = await fetch('/api/projects?limit=100');
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading Master Records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-shield-halved text-2xl"></i>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Restricted Area</h1>
          <p className="text-gray-500 text-sm mb-8">{error}</p>
          <Link href="/dashboard" className="inline-block w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">SuperAdmin Control Panel</h1>
            <p className="text-gray-500 mt-2">Manage all system projects and user activity.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Live Monitoring</span>
            </div>
            <button onClick={fetchProjects} className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-gray-400 hover:text-blue-600">
               <i className="fa-solid fa-rotate-right"></i>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Project Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Owner</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Theme</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Last Updated</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {projects.map((project) => (
                  <tr key={project._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{project.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono mt-1 uppercase">{project._id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-blue-600">{project.userId?.name || 'Unknown'}</span>
                        <span className="text-xs text-gray-400">{project.userId?.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        project.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-gray-500 uppercase">
                      {project.theme}
                    </td>
                    <td className="px-6 py-5 text-xs text-gray-400">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/editor/${project._id}`} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                          <i className="fa-solid fa-pen-to-square"></i>
                        </Link>
                        <button onClick={() => handleDelete(project._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {projects.length === 0 && (
            <div className="py-20 text-center">
              <div className="text-gray-300 text-4xl mb-4"><i className="fa-solid fa-folder-open"></i></div>
              <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">No projects found in the system.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
