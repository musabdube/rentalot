'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { UserCircle, X } from 'lucide-react';

type ProfileData = {
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  postalCode?: string | null;
};

const DISMISS_KEY = 'profileCompletionPromptDismissedAt';
const DISMISS_DAYS = 7;

function isDismissedRecently(): boolean {
  if (typeof window === 'undefined') return true;
  const value = window.localStorage.getItem(DISMISS_KEY);
  if (!value) return false;
  const timestamp = Number(value);
  if (Number.isNaN(timestamp)) return false;
  const daysMs = DISMISS_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - timestamp < daysMs;
}

function markDismissed() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
}

function isProfileIncomplete(profile: ProfileData | null): boolean {
  if (!profile) return false;
  return !profile.phone || !profile.address || !profile.city || !profile.country;
}

export default function ProfileCompletionPrompt() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const role = session?.user?.role;

  const profilePath = useMemo(() => {
    if (role === 'LANDLORD') return '/landlord/profile';
    if (role === 'TENANT') return '/tenant/profile';
    return '';
  }, [role]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (!role || (role !== 'TENANT' && role !== 'LANDLORD')) return;
    if (!pathname) return;

    if (pathname.startsWith('/auth') || pathname.startsWith('/admin')) return;
    if (pathname.startsWith(profilePath)) return;
    if (isDismissedRecently()) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const endpoint = role === 'LANDLORD' ? '/api/landlord/profile' : '/api/tenant/profile';
        const response = await fetch(endpoint);
        if (!response.ok) return;
        const data = await response.json();
        if (isProfileIncomplete(data)) {
          setShow(true);
        }
      } catch (error) {
        console.error('Error checking profile completeness:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [status, role, pathname, profilePath]);

  if (status === 'loading' || loading || !show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Complete your profile</h2>
          </div>
          <button
            onClick={() => {
              setShow(false);
              markDismissed();
            }}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close prompt"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600">
            Add your phone number and address details to complete your profile. This helps landlords and tenants trust
            each other and unlocks more features.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setShow(false);
                markDismissed();
                router.push(profilePath);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
            >
              Complete now
            </button>
            <button
              onClick={() => {
                setShow(false);
                markDismissed();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
