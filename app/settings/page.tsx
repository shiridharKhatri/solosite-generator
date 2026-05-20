'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TopNavBar } from '@/components/TopNavBar';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);

  // Google Drive state
  const [googleStatus, setGoogleStatus] = useState<{ connected: boolean; autoBackup: boolean }>({ connected: false, autoBackup: false });
  const [googleLoading, setGoogleLoading] = useState(true);
  const [googleMessage, setGoogleMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isGoogleSettingsSaving, setIsGoogleSettingsSaving] = useState(false);

  // Google Drive handlers
  const handleConnectGoogle = () => {
    window.location.href = '/api/auth/google';
  };

  const handleDisconnectGoogle = async () => {
    setIsGoogleSettingsSaving(true);
    try {
      const res = await fetch('/api/auth/google/status', {
        method: 'DELETE',
      });
      if (res.ok) {
        setGoogleStatus({ connected: false, autoBackup: false });
        setGoogleMessage({ type: 'success', text: 'Successfully disconnected Google Drive.' });
      } else {
        setGoogleMessage({ type: 'error', text: 'Failed to disconnect Google Drive.' });
      }
    } catch (err) {
      setGoogleMessage({ type: 'error', text: 'A network error occurred. Please try again.' });
    } finally {
      setIsGoogleSettingsSaving(false);
    }
  };

  const handleToggleAutoBackup = async (checked: boolean) => {
    setIsGoogleSettingsSaving(true);
    try {
      const res = await fetch('/api/auth/google/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoBackup: checked }),
      });
      if (res.ok) {
        setGoogleStatus(prev => ({ ...prev, autoBackup: checked }));
      } else {
        setGoogleMessage({ type: 'error', text: 'Failed to update backup settings.' });
      }
    } catch (err) {
      setGoogleMessage({ type: 'error', text: 'A network error occurred. Please try again.' });
    } finally {
      setIsGoogleSettingsSaving(false);
    }
  };

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  React.useEffect(() => {
    if (status === 'authenticated') {
      // Fetch Google Status
      fetch('/api/auth/google/status')
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setGoogleStatus({ connected: data.connected, autoBackup: data.autoBackup });
          }
        })
        .catch(err => console.error("Error fetching Google status:", err))
        .finally(() => setGoogleLoading(false));

      // Check URL search parameters for Google OAuth callback status
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const googleParam = params.get('google');
        if (googleParam === 'success') {
          setGoogleMessage({ type: 'success', text: 'Successfully connected to Google Drive!' });
          window.history.replaceState({}, document.title, window.location.pathname);
        } else if (googleParam === 'error') {
          const msg = params.get('msg') || 'Connection failed.';
          setGoogleMessage({ type: 'error', text: `Google Drive connection error: ${msg}` });
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }, [status]);

  const handleCreateAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAdminLoading(true);
    setAdminError(null);
    setAdminSuccess(null);

    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      });

      if (res.ok) {
        setAdminSuccess('Administrator account created successfully!');
        (e.target as HTMLFormElement).reset();
      } else {
        const data = await res.json();
        setAdminError(data.error || 'Failed to create administrator account.');
      }
    } catch (err) {
      setAdminError('A network error occurred. Please try again.');
    } finally {
      setIsAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-body">
      <TopNavBar userEmail={session?.user?.email} />
      <main className="pt-16 pb-20 px-8 max-w-screen-2xl mx-auto flex flex-col md:flex-row gap-16 font-body">

        <aside className="hidden md:flex flex-col w-64 sticky top-32 h-fit gap-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-900 font-semibold bg-white rounded-xl shadow-sm border border-zinc-100 transition-all">
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

          <div className="bg-white rounded-2xl p-10 shadow-sm border border-zinc-100">
            <h2 className="text-2xl font-bold text-zinc-900 mb-8 font-headline tracking-tighter uppercase">Profile Identity</h2>
            <div className="flex items-start gap-12">
              <div className="relative group cursor-pointer w-32 h-32 flex-shrink-0">
                <div className="w-full h-full rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-4xl shadow-lg group-hover:bg-zinc-200 transition-all font-headline font-bold text-zinc-400">
                  {session?.user?.name?.[0] || session?.user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 font-body">Full Name</label>
                  <input className="w-full bg-zinc-50 border-transparent border-2 focus:border-primary/20 rounded-xl px-4 py-3 outline-none transition-all" type="text" defaultValue={session?.user?.name || ''} placeholder="Add your name" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 font-body">Email</label>
                  <input className="w-full bg-zinc-100 border-none rounded-xl px-4 py-3 text-zinc-400 cursor-not-allowed" type="email" defaultValue={session?.user?.email || ''} readOnly />
                </div>
              </div>
            </div>
            <div className="mt-10 flex justify-end">
              <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95">Save Changes</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-10 shadow-sm border border-zinc-100 mt-8">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2 font-headline tracking-tighter uppercase">Admin Management</h2>
            <p className="text-zinc-500 mb-8 font-body">Create new administrator accounts. Only current admins can perform this action.</p>

            {adminError && (
              <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {adminError}
              </div>
            )}

            {adminSuccess && (
              <div className="mb-6 bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                {adminSuccess}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 font-body">Full Name</label>
                  <input name="name" required disabled={isAdminLoading} className="w-full bg-zinc-50 border-transparent border-2 focus:border-primary/20 rounded-xl px-4 py-3 font-body outline-none transition-all" type="text" placeholder="Lycoris" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 font-body">Email</label>
                  <input name="email" required disabled={isAdminLoading} className="w-full bg-zinc-50 border-transparent border-2 focus:border-primary/20 rounded-xl px-4 py-3 font-body outline-none transition-all" type="email" placeholder="admin@company.com" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 font-body">Temporary Password</label>
                  <input name="password" required disabled={isAdminLoading} className="w-full bg-zinc-50 border-transparent border-2 focus:border-primary/20 rounded-xl px-4 py-3 font-body outline-none transition-all" type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isAdminLoading}
                  className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isAdminLoading && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isAdminLoading ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>

          {/* Google Drive Backup Section */}
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-zinc-100 mt-8">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2 font-headline tracking-tighter uppercase">Google Drive Backup</h2>
            <p className="text-zinc-500 mb-8 font-body">Automatically archive zip backups of your projects to a secure folder in your Google Drive.</p>

            {googleMessage && (
              <div className={`mb-6 border px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                googleMessage.type === 'success' 
                  ? 'bg-green-50 border-green-100 text-green-600' 
                  : 'bg-red-50 border-red-100 text-red-600'
              }`}>
                {googleMessage.type === 'success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                )}
                {googleMessage.text}
              </div>
            )}

            {googleLoading ? (
              <div className="flex items-center gap-2 py-4">
                <svg className="animate-spin h-5 w-5 text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-zinc-500 text-sm">Checking status...</span>
              </div>
            ) : googleStatus.connected ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-green-50/30 border border-green-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 text-sm">Google Drive is Connected</h3>
                      <p className="text-xs text-zinc-500">Backups will save to the `SoloSite Backups` folder on your Drive.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDisconnectGoogle}
                    disabled={isGoogleSettingsSaving}
                    className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                  >
                    Disconnect
                  </button>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center h-5">
                    <input
                      id="auto-backup"
                      type="checkbox"
                      checked={googleStatus.autoBackup}
                      onChange={(e) => handleToggleAutoBackup(e.target.checked)}
                      disabled={isGoogleSettingsSaving}
                      className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900 cursor-pointer"
                    />
                  </div>
                  <div className="text-sm">
                    <label htmlFor="auto-backup" className="font-bold text-zinc-800 cursor-pointer">
                      Automatically backup to Google Drive on export
                    </label>
                    <p className="text-zinc-500 text-xs mt-1">
                      When enabled, exporting a site will automatically upload a copy of the generated ZIP file to Google Drive.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-zinc-50 border border-zinc-200/50 rounded-xl text-center flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-sm">Google Drive is Disconnected</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mt-1">Link your Google account to automatically archive and back up your project ZIP exports in Google Drive.</p>
                </div>
                <button
                  onClick={handleConnectGoogle}
                  className="bg-zinc-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-zinc-800 transition-all active:scale-95 text-xs flex items-center gap-2"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.24 10.285V13.4h6.887c-.648 2.41-2.519 4.19-5.136 4.19A5.88 5.88 0 0 1 8 11.758a5.88 5.88 0 0 1 5.99-5.942 5.683 5.683 0 0 1 3.99 1.626l2.354-2.3a9.143 9.143 0 0 0-6.344-2.434C8.94 2.708 4.793 6.786 4.793 11.77c0 4.985 4.148 9.063 9.197 9.063 5.253 0 9.043-3.626 9.043-9.063 0-.585-.052-1.154-.15-1.485H12.24z"/>
                  </svg>
                  Connect Google Drive
                </button>
              </div>
            )}
          </div>

        </section>
      </main>
    </div>
  );
}
