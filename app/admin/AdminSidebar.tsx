'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Users, Settings, BarChart3, ShieldCheck, ClipboardList, Building2, Star } from 'lucide-react';
import { useState } from 'react';

const items = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/listings', label: 'Listings', icon: ClipboardList },
  { href: '/admin/properties', label: 'Properties', icon: Building2 },
  { href: '/admin/reports', label: 'Reports', icon: ShieldCheck },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/featured', label: 'Featured', icon: Star },
  { href: '/admin/verify', label: 'Verify', icon: ShieldCheck },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/profile', label: 'Profile', icon: Users },
];

export default function AdminSidebar({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  return (
    <aside className={`w-full flex-shrink-0 ${className}`}>
      <div className="flex flex-col bg-white border border-gray-200 rounded-lg transition-all w-full">
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12l9-9 9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            {open && <div className="text-sm font-bold">Admin</div>}
          </div>
          <button onClick={() => setOpen(s => !s)} aria-label="Toggle sidebar" className="p-2 rounded-md hover:bg-gray-100">
            <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <nav className={`flex-1 overflow-y-auto py-3 ${open ? 'block' : 'hidden'}`}>
          <ul className="flex flex-row gap-2 px-2 overflow-x-auto">
            {items.map((it) => {
              const Icon = it.icon;
              const active = pathname?.startsWith(it.href);
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors group whitespace-nowrap ${active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <Icon className="w-5 h-5" />
                    {open && <span className="text-sm font-medium">{it.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

      </div>
    </aside>
  );
}
