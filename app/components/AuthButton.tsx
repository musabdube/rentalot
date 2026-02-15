'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { RoleBadge } from './RoleBadge';
import { VerificationBadge } from './VerificationBadge';

export function AuthButton() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    if (session.user.image) {
      setAvatarUrl(session.user.image);
      return;
    }

    const fetchAvatar = async () => {
      try {
        let url = '';
        if (session.user.role === 'TENANT') url = '/api/tenant/profile';
        else if (session.user.role === 'LANDLORD') url = '/api/landlord/profile';
        else if (session.user.role === 'ADMIN') url = '/api/admin/profile';
        if (!url) return;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.avatar) setAvatarUrl(data.avatar);
        if (data?.verificationStatus !== undefined) setIsVerified(data.verificationStatus);
      } catch (err) {
        console.error('Failed to fetch avatar for dropdown', err);
      }
    };

    fetchAvatar();
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <button
        onClick={() => signIn()}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
      >
        Sign In
      </button>
    );
  }

  const getDashboardLink = () => {
    const role = session?.user?.role?.toLowerCase();
    if (role === 'tenant') return '/tenant/dashboard';
    if (role === 'landlord') return '/landlord/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/';
  };

  const getProfileLink = () => {
    const role = session?.user?.role?.toLowerCase();
    if (role === 'tenant') return '/tenant/profile';
    if (role === 'landlord') return '/landlord/profile';
    if (role === 'admin') return '/admin/settings';
    return '/';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Account Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session?.user?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
              <User className="w-4 h-4" />
            </div>
          )}
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1">
              <p className="text-sm font-medium text-gray-900">{session?.user?.name || 'User'}</p>
              {isVerified && <VerificationBadge isVerified={isVerified} size="sm" />}
            </div>
            <RoleBadge role={session?.user?.role} size="sm" variant="icon-only" />
          </div>
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt={session?.user?.name || 'User'} className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                <User className="w-6 h-6" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name || 'User'}</p>
                {isVerified && <VerificationBadge isVerified={isVerified} size="sm" />}
              </div>
              <div className="mt-2">
                <RoleBadge role={session?.user?.role} size="sm" variant="badge" />
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href={getDashboardLink()}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              href={getProfileLink()}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4" />
              Settings & Profile
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-2"></div>

          {/* Sign Out */}
          <button
            onClick={() => {
              signOut();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
