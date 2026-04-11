'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Building2, ArrowRight, AlertTriangle } from 'lucide-react';

export default function SwitchToLandlordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (status === 'loading') return <div className="p-8 text-center text-gray-400">Loading...</div>;
  if (!session || session.user?.role !== 'TENANT') {
    router.replace('/tenant/dashboard');
    return null;
  }

  const handleSwitch = async () => {
    setLoading(true);
    setError('');
    const res = await fetch('/api/tenant/switch-role', { method: 'POST' });
    setLoading(false);
    if (res.ok) {
      // Sign out so a fresh session with the new role is loaded
      await signOut({ callbackUrl: '/auth/signin?switched=1' });
    } else {
      const d = await res.json();
      setError(d.error ?? 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2"><Building2 className="w-5 h-5 text-emerald-600" />Become a Landlord</h1>
        <p className="text-sm text-gray-500 mb-6">
          Switching to a landlord account lets you list properties, manage rental requests, and more.
          <br /><br />
          <span className="text-amber-700 font-medium">This action changes your account role. You will be signed out and need to sign in again.</span>
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5 text-left flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
          </div>
        )}

        <button
          onClick={handleSwitch}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-full font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors mb-3"
        >
          {loading ? 'Switching...' : <><ArrowRight className="w-4 h-4" /> Switch to Landlord</>}
        </button>

        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
