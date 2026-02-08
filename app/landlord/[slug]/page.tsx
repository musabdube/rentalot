'use client';

import { use } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const pages = [
  { href: '/landlord/requests', label: 'Rental Requests' },
  { href: '/landlord/messages', label: 'Messages' },
  { href: '/landlord/analytics', label: 'Analytics' },
  { href: '/landlord/profile', label: 'My Profile' },
];

export default function LandlordStubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { data: session, status } = useSession();
  const resolvedParams = use(params);

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>;
  }

  if (!session || session.user?.role !== 'LANDLORD') {
    redirect('/auth/signin');
  }

  const page = pages.find(p => p.href === `/landlord/${resolvedParams.slug}`);
  const title = page?.label || 'Page';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/landlord/dashboard"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title} - Coming Soon</h2>
          <p className="text-gray-600">This feature is being developed. Check back soon!</p>
        </div>
      </main>
    </div>
  );
}
