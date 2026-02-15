'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, Home, BarChart3, MessageSquare, Shield, Flag, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalConversations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats();
    }
  }, [status]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/messages/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching message stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>;
  }

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Listings</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <Home className="w-12 h-12 text-emerald-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Signups</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <Users className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Messages</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalMessages}</p>
              </div>
              <MessageSquare className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Conversations</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalConversations}</p>
              </div>
              <MessageSquare className="w-12 h-12 text-teal-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Admin Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/users" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <Users className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Users</h3>
              <p className="text-gray-600">View, edit, and remove user accounts</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                View Users →
              </div>
            </div>
          </Link>

          <Link href="/admin/properties" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <Home className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Approve Properties</h3>
              <p className="text-gray-600">Review and approve new property listings</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                View Properties →
              </div>
            </div>
          </Link>

          <Link href="/admin/listings" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <Home className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Featured Listings</h3>
              <p className="text-gray-600">Manage and promote featured properties</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                View Listings →
              </div>
            </div>
          </Link>

          <Link href="/admin/reports" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-red-500">
              <Flag className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Reported Content</h3>
              <p className="text-gray-600">Review user reports for scams, spam, and inappropriate content</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                View Reports →
              </div>
            </div>
          </Link>

          <Link href="/admin/enquiries" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-emerald-500">
              <Mail className="w-12 h-12 text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enquiries</h3>
              <p className="text-gray-600">View contact form submissions from users</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                View Enquiries →
              </div>
            </div>
          </Link>

          <Link href="/admin/messages" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500">
              <MessageSquare className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Messages</h3>
              <p className="text-gray-600">View and manage all platform messages</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                View Messages →
              </div>
            </div>
          </Link>

          <Link href="/admin/verify" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-amber-500">
              <Shield className="w-12 h-12 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verification</h3>
              <p className="text-gray-600">Approve and verify properties, tenants, and landlords</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                Manage Verification →
              </div>
            </div>
          </Link>

          <Link href="/admin/analytics" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <BarChart3 className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600">View platform statistics and insights</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                View Analytics →
              </div>
            </div>
          </Link>

          <Link href="/admin/featured" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <Home className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Featured Properties</h3>
              <p className="text-gray-600">Set and manage featured listings</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                Manage Featured →
              </div>
            </div>
          </Link>

          <Link href="/admin/settings" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <Shield className="w-12 h-12 text-red-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Settings</h3>
              <p className="text-gray-600">Platform settings and configuration</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                Go to Settings →
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
