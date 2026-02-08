'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Users, Home, MessageSquare, CheckCircle, Clock, AlertCircle, BarChart3, PieChart, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AnalyticsData {
  // User Stats
  totalUsers: number;
  totalTenants: number;
  totalLandlords: number;
  totalAdmins: number;
  verifiedUsers: number;
  newUsersThisMonth: number;

  // Property Stats
  totalProperties: number;
  activeProperties: number;
  pendingProperties: number;
  rejectedProperties: number;
  approvedProperties: number;
  propertyByType: {
    [key: string]: number;
  };
  propertiesByCity: {
    [key: string]: number;
  };

  // Rental Request Stats
  totalRentalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  completedRequests: number;
  cancelledRequests: number;

  // Message Stats
  totalMessages: number;
  unreadMessages: number;
  archivedMessages: number;
  messagesSentThisMonth: number;

  // Viewing Stats
  totalViewings: number;
  pendingViewings: number;
  confirmedViewings: number;
  cancelledViewings: number;
  completedViewings: number;

  // Report Stats
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  reportsByType: {
    [key: string]: number;
  };

  // Payment Stats
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalPaymentAmount: number;

  // Platform Growth
  avgPropertiesPerLandlord: number;
  avgRentalRequestsPerProperty: number;
  platformEngagementRate: number;
}

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAnalytics();
    }
  }, [status]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="p-8">Loading analytics...</div>;
  }

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  if (!analytics) {
    return <div className="p-8">Failed to load analytics</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights and statistics</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            User Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalUsers}</p>
              <p className="text-xs text-gray-500 mt-1">All users</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600">Tenants</p>
              <p className="text-3xl font-bold text-blue-600">{analytics.totalTenants}</p>
              <p className="text-xs text-gray-500 mt-1">{analytics.totalUsers > 0 ? ((analytics.totalTenants / analytics.totalUsers) * 100).toFixed(1) : 0}% of users</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600">Landlords</p>
              <p className="text-3xl font-bold text-emerald-600">{analytics.totalLandlords}</p>
              <p className="text-xs text-gray-500 mt-1">{analytics.totalUsers > 0 ? ((analytics.totalLandlords / analytics.totalUsers) * 100).toFixed(1) : 0}% of users</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600">Verified</p>
              <p className="text-3xl font-bold text-green-600">{analytics.verifiedUsers}</p>
              <p className="text-xs text-gray-500 mt-1">{analytics.totalUsers > 0 ? ((analytics.verifiedUsers / analytics.totalUsers) * 100).toFixed(1) : 0}% verified</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600">New This Month</p>
              <p className="text-3xl font-bold text-purple-600">{analytics.newUsersThisMonth}</p>
              <p className="text-xs text-gray-500 mt-1">New signups</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-3xl font-bold text-red-600">{analytics.totalAdmins}</p>
              <p className="text-xs text-gray-500 mt-1">Admin accounts</p>
            </div>
          </div>
        </div>

        {/* Property Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Home className="w-6 h-6 text-emerald-600" />
            Property Statistics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-sm text-gray-600">Total Properties</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalProperties}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-3xl font-bold text-green-600">{analytics.activeProperties}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-600">{analytics.pendingProperties}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.approvedProperties}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{analytics.rejectedProperties}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-sm text-gray-600">Avg per Landlord</p>
                <p className="text-3xl font-bold text-purple-600">{analytics.avgPropertiesPerLandlord.toFixed(1)}</p>
              </div>
            </div>

            {/* Property Types */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties by Type</h3>
              <div className="space-y-3">
                {Object.entries(analytics.propertyByType).map(([type, count]) => (
                  <div key={type}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-700 capitalize">{type}</span>
                      <span className="text-sm font-semibold text-gray-900">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{ width: `${analytics.totalProperties > 0 ? (count / analytics.totalProperties) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Cities */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties by City</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {Object.entries(analytics.propertiesByCity)
                  .sort((a, b) => b[1] - a[1])
                  .map(([city, count]) => (
                    <div key={city} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">{city}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${analytics.totalProperties > 0 ? (count / analytics.totalProperties) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-sm p-6 border border-emerald-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Distribution</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active</span>
                  <span className="font-semibold text-emerald-600">{analytics.totalProperties > 0 ? ((analytics.activeProperties / analytics.totalProperties) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">{analytics.totalProperties > 0 ? ((analytics.pendingProperties / analytics.totalProperties) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Approved</span>
                  <span className="font-semibold text-blue-600">{analytics.totalProperties > 0 ? ((analytics.approvedProperties / analytics.totalProperties) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rejected</span>
                  <span className="font-semibold text-red-600">{analytics.totalProperties > 0 ? ((analytics.rejectedProperties / analytics.totalProperties) * 100).toFixed(1) : 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rental Request Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-purple-600" />
            Rental Request Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalRentalRequests}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{analytics.pendingRequests}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-green-600">{analytics.approvedRequests}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{analytics.rejectedRequests}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-blue-600">{analytics.completedRequests}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600">Avg per Property</p>
              <p className="text-3xl font-bold text-purple-600">{analytics.avgRentalRequestsPerProperty.toFixed(1)}</p>
            </div>
          </div>
        </div>

        {/* Viewing Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="w-6 h-6 text-orange-600" />
            Viewing Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600">Total Viewings</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalViewings}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{analytics.pendingViewings}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-3xl font-bold text-green-600">{analytics.confirmedViewings}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-blue-600">{analytics.completedViewings}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-3xl font-bold text-red-600">{analytics.cancelledViewings}</p>
            </div>
          </div>
        </div>

        {/* Message Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-green-600" />
            Message Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalMessages}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-3xl font-bold text-yellow-600">{analytics.unreadMessages}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600">Archived</p>
              <p className="text-3xl font-bold text-gray-600">{analytics.archivedMessages}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-3xl font-bold text-green-600">{analytics.messagesSentThisMonth}</p>
            </div>
          </div>
        </div>

        {/* Report Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
            Report Statistics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalReports}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{analytics.pendingReports}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-3xl font-bold text-green-600">{analytics.resolvedReports}</p>
              </div>
            </div>

            {/* Reports by Type */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports by Type</h3>
              <div className="space-y-3">
                {Object.entries(analytics.reportsByType).map(([type, count]) => (
                  <div key={type}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-700 capitalize">{type}</span>
                      <span className="text-sm font-semibold text-gray-900">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${analytics.totalReports > 0 ? (count / analytics.totalReports) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-600" />
            Payment Statistics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalPayments}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{analytics.completedPayments}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{analytics.pendingPayments}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-3xl font-bold text-red-600">{analytics.failedPayments}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl shadow-sm p-6 border border-teal-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-bold text-2xl text-teal-600">${analytics.totalPaymentAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">
                    {analytics.totalPayments > 0 ? ((analytics.completedPayments / analytics.totalPayments) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Payment</span>
                  <span className="font-semibold text-gray-900">
                    ${analytics.totalPayments > 0 ? (analytics.totalPaymentAmount / analytics.totalPayments).toFixed(2) : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Engagement */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            Platform Engagement
          </h2>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-sm p-8 border border-indigo-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-indigo-600 mb-2">
                  {(analytics.platformEngagementRate * 100).toFixed(1)}%
                </div>
                <p className="text-gray-700 font-medium">Engagement Rate</p>
                <p className="text-sm text-gray-600">Active interactions on platform</p>
              </div>

              <div className="text-center">
                <div className="text-5xl font-bold text-purple-600 mb-2">
                  {analytics.totalUsers > 0 ? ((analytics.totalLandlords + analytics.totalTenants) / analytics.totalUsers * 100).toFixed(1) : 0}%
                </div>
                <p className="text-gray-700 font-medium">User Adoption</p>
                <p className="text-sm text-gray-600">Tenants + Landlords</p>
              </div>

              <div className="text-center">
                <div className="text-5xl font-bold text-pink-600 mb-2">
                  {analytics.totalUsers > 0 ? (analytics.verifiedUsers / analytics.totalUsers * 100).toFixed(1) : 0}%
                </div>
                <p className="text-gray-700 font-medium">Verification Rate</p>
                <p className="text-sm text-gray-600">Verified users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Key Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-semibold text-blue-900 mb-1">Most Active City</p>
              <p className="text-blue-700">
                {Object.entries(analytics.propertiesByCity).length > 0
                  ? Object.entries(analytics.propertiesByCity).sort((a, b) => b[1] - a[1])[0][0]
                  : 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="font-semibold text-green-900 mb-1">Most Popular Property Type</p>
              <p className="text-green-700">
                {Object.entries(analytics.propertyByType).length > 0
                  ? Object.entries(analytics.propertyByType).sort((a, b) => b[1] - a[1])[0][0]
                  : 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="font-semibold text-purple-900 mb-1">Approval Rate</p>
              <p className="text-purple-700">
                {analytics.totalProperties > 0 ? ((analytics.activeProperties / analytics.totalProperties) * 100).toFixed(1) : 0}% active properties
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="font-semibold text-orange-900 mb-1">Response Status</p>
              <p className="text-orange-700">
                {analytics.pendingReports > 0 ? `${analytics.pendingReports} reports pending review` : 'All reports reviewed'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
