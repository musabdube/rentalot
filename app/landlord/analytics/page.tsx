'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Home, 
  Users, 
  TrendingUp, 
  Eye, 
  CheckCircle, 
  Clock,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface AnalyticsData {
  totalProperties: number;
  activeListings: number;
  totalViews: number;
  rentalRequests: number;
  approvedRequests: number;
  totalRevenue: number;
  occupancyRate: number;
  averageRent: number;
  viewsThisMonth: number;
  requestsThisMonth: number;
  topProperty: {
    title: string;
    views: number;
    requests: number;
  } | null;
}

export default function LandlordAnalyticsPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'LANDLORD') {
      redirect('/auth/signin');
    }

    // Fetch analytics data
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/landlord/analytics');
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [status, session]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">Failed to load analytics data.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/landlord/dashboard" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4 font-medium">
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Analytics & Insights</h1>
            <p className="text-gray-600 mt-2">Track your property performance and rental activity</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
          {['week', 'month', 'quarter', 'year'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors capitalize text-sm sm:text-base ${
                timeRange === range
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Properties */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Total Properties</span>
              <Home className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalProperties}</p>
            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              {analytics.activeListings} active listings
            </p>
          </div>

          {/* Total Views */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Total Views</span>
              <Eye className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalViews.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-2">
              +{analytics.viewsThisMonth} this {timeRange}
            </p>
          </div>

          {/* Rental Requests */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Rental Requests</span>
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.rentalRequests}</p>
            <p className="text-sm text-green-600 mt-2">
              {analytics.approvedRequests} approved
            </p>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">${analytics.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-2">
              Avg: ${analytics.averageRent}/mo
            </p>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Occupancy Rate */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Occupancy Rate</h3>
              <PieChart className="w-5 h-5 text-blue-500" />
            </div>
            <div className="mb-4">
              <p className="text-4xl font-bold text-gray-900">{analytics.occupancyRate}%</p>
              <p className="text-sm text-gray-600 mt-1">Properties occupied</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${analytics.occupancyRate}%` }}
              ></div>
            </div>
          </div>

          {/* Request Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Request Status</h3>
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Approved
                </span>
                <span className="font-semibold text-gray-900">{analytics.approvedRequests}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  Pending
                </span>
                <span className="font-semibold text-gray-900">{analytics.rentalRequests - analytics.approvedRequests}</span>
              </div>
            </div>
          </div>

          {/* Monthly Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">This {timeRange}</h3>
              <BarChart3 className="w-5 h-5 text-purple-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-500" />
                  Views
                </span>
                <span className="font-semibold text-gray-900">{analytics.viewsThisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  Requests
                </span>
                <span className="font-semibold text-gray-900">{analytics.requestsThisMonth}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Property */}
        {analytics.topProperty && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Property</h3>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{analytics.topProperty.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">Your most popular listing</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Views</p>
                  <p className="text-3xl font-bold text-blue-600">{analytics.topProperty.views}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Rental Requests</p>
                  <p className="text-3xl font-bold text-purple-600">{analytics.topProperty.requests}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/landlord/properties" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
            <Home className="w-8 h-8 text-emerald-600 mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Manage Properties</h4>
            <p className="text-sm text-gray-600">View and edit your listings</p>
          </Link>

          <Link href="/landlord/requests" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
            <Users className="w-8 h-8 text-purple-600 mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Rental Requests</h4>
            <p className="text-sm text-gray-600">Review and manage requests</p>
          </Link>

          <Link href="/landlord/messages" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
            <Calendar className="w-8 h-8 text-blue-600 mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Messages</h4>
            <p className="text-sm text-gray-600">Communicate with tenants</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
