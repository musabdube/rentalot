'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Home, Plus, MessageSquare, Settings, BarChart3, LogOut, Calendar, CheckCircle, AlertCircle, Clock, Edit } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function LandlordDashboard() {
  const { data: session, status } = useSession();
  const [propertyStats, setPropertyStats] = useState({
    available: 0,
    unavailable: 0,
    pendingRent: 0,
    inactive: 0,
    total: 0,
    activeNotApproved: 0,
  });

  useEffect(() => {
    if (session?.user?.role === 'LANDLORD') {
      const fetchPropertyStats = async () => {
        try {
          const response = await fetch('/api/landlord/properties');
          if (response.ok) {
            const data = await response.json();
            const stats = {
              available: data.filter((p: any) => p.availabilityStatus === 'AVAILABLE').length,
              unavailable: data.filter((p: any) => p.availabilityStatus === 'UNAVAILABLE').length,
              pendingRent: data.filter((p: any) => p.availabilityStatus === 'PENDING_RENT').length,
              inactive: data.filter((p: any) => p.status !== 'ACTIVE' && p.status !== 'APPROVED').length,
              activeNotApproved: data.filter((p: any) => p.status !== 'ACTIVE' && p.availabilityStatus === 'AVAILABLE').length,
              total: data.length,
            };
            setPropertyStats(stats);
          }
        } catch (error) {
          console.error('Error fetching property stats:', error);
        }
      };
      fetchPropertyStats();
    }
  }, [session]);

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>;
  }

  if (!session || session.user?.role !== 'LANDLORD') {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Properties</p>
                <p className="text-3xl font-bold text-gray-900">{propertyStats.total}</p>
              </div>
              <Home className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" /> Available
                </p>
                <p className="text-3xl font-bold text-green-600">{propertyStats.available}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-red-600" /> Unavailable
                </p>
                <p className="text-3xl font-bold text-red-600">{propertyStats.unavailable}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-yellow-600" /> Pending Rent
                </p>
                <p className="text-3xl font-bold text-yellow-600">{propertyStats.pendingRent}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/landlord/properties" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <Home className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Properties</h3>
              <p className="text-gray-600">Add, edit, and delete your rental listings</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                Manage Properties →
              </div>
            </div>
          </Link>

          <Link href="/landlord/properties/new" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200">
              <Plus className="w-12 h-12 text-emerald-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Add New Property</h3>
              <p className="text-gray-600">Create a new rental listing with images and details</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                Add Property →
              </div>
            </div>
          </Link>

          <Link href="/landlord/viewings" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <Calendar className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Viewing Requests</h3>
              <p className="text-gray-600">Manage scheduled apartment viewing appointments</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                View Requests →
              </div>
            </div>
          </Link>

          <Link href="/landlord/requests" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <BarChart3 className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Rental Requests</h3>
              <p className="text-gray-600">Review and approve tenant rental applications</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                View Requests →
              </div>
            </div>
          </Link>

          <Link href="/landlord/messages" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <MessageSquare className="w-12 h-12 text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Messages</h3>
              <p className="text-gray-600">Chat with tenants and manage conversations</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                View Messages →
              </div>
            </div>
          </Link>

          <Link href="/landlord/analytics" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <BarChart3 className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600">View stats and insights about your listings</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                View Analytics →
              </div>
            </div>
          </Link>

          <Link href="/blog/my-posts" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <Edit className="w-12 h-12 text-indigo-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">My Blog Posts</h3>
              <p className="text-gray-600">Share insights about areas and properties</p>
              <div className="mt-4 text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                View Posts →
              </div>
            </div>
          </Link>

          <Link href="/landlord/profile" className="group">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-emerald-600">👤</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">My Profile</h3>
              <p className="text-gray-600">Edit your profile and business information</p>
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
