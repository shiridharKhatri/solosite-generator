'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export const TopNavBar = ({ userEmail }: { userEmail?: string | null }) => {
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Templates', href: '/templates' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Settings', href: '/settings' },
  ];

  return (
    <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-xl shadow-sm shadow-zinc-200/50">
      <div className="flex justify-between items-center px-8 h-20 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-12">
          <div
            className="text-2xl font-semibold tracking-tight text-zinc-900 cursor-pointer font-headline"
            onClick={() => router.push('/dashboard')}
          >
            SoloSite
          </div>
          <nav className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`${pathname === link.href ? 'text-lime-700 font-bold border-b-2 border-lime-500' : 'text-zinc-500 hover:text-zinc-800'} pb-1 transition-all font-body text-sm`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/editor/new')}
            className="bg-lime-600 hover:bg-lime-700 text-white px-6 py-2.5 rounded-full font-bold text-sm active:scale-95 transition-all shadow-md shadow-lime-200 font-body"
          >
            Create New
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-zinc-200">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-zinc-200 bg-zinc-100 flex items-center justify-center">
              {userEmail ? (
                <span className="text-xs font-bold text-zinc-500 capitalize">{userEmail[0]}</span>
              ) : (
                <div className="w-full h-full bg-zinc-200" />
              )}
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-xs font-bold text-zinc-400 hover:text-rose-500 transition-colors uppercase tracking-wider"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
