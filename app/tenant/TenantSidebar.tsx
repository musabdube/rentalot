'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Heart, FileText, Calendar, User, Menu, Edit, Users, Building2 } from 'lucide-react';
import { useState } from 'react';

const items = [
  { href: '/tenant/dashboard', label: 'Dashboard', icon: Home },
  { href: '/tenant/messages', label: 'Messages', icon: MessageSquare },
  { href: '/tenant/favorites', label: 'Favorites', icon: Heart },
  { href: '/tenant/requests', label: 'Requests', icon: FileText },
  { href: '/tenant/viewings', label: 'Viewings', icon: Calendar },
  { href: '/tenant/roommate', label: 'Roommates', icon: Users },
  { href: '/blog/my-posts', label: 'My Blog', icon: Edit },
  { href: '/tenant/profile', label: 'Profile', icon: User },
  { href: '/tenant/switch-role', label: 'Go Landlord', icon: Building2 },
];

export default function TenantSidebar({ className = '' }: { className?: string }) {
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
            {open && <div className="text-sm font-bold">Tenant</div>}
          </div>
          <button onClick={() => setOpen(s => !s)} aria-label="Toggle sidebar" className="p-2 rounded-md hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
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
