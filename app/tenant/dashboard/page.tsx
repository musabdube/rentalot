'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Heart, FileText, MessageSquare, LogOut, Calendar } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function TenantDashboard() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>;
  }

  if (!session || session.user?.role !== 'TENANT') {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Favorite Properties</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <Heart className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rental Requests</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <FileText className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Messages</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <MessageSquare className="w-12 h-12 text-emerald-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <FileText className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/tenant/favorites" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <Heart className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Favorite Properties</h3>
              <p className="text-gray-600">Save and manage your favorite rental properties</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                View Favorites →
              </div>
            </div>
          </Link>

          <Link href="/tenant/viewings" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <Calendar className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Scheduled Viewings</h3>
              <p className="text-gray-600">Manage your apartment viewing appointments</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                View Viewings →
              </div>
            </div>
          </Link>

          <Link href="/tenant/requests" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <FileText className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Rental Requests</h3>
              <p className="text-gray-600">Track your applications and check approval status</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                View Requests →
              </div>
            </div>
          </Link>

          <Link href="/tenant/messages" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <MessageSquare className="w-12 h-12 text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Messages</h3>
              <p className="text-gray-600">Chat with landlords about your applications</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                View Messages →
              </div>
            </div>
          </Link>

          <Link href="/tenant/profile" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-emerald-600">👤</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">My Profile</h3>
              <p className="text-gray-600">Edit your profile and verification details</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                Edit Profile →
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
