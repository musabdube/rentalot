'use client';

import { Home, Heart, Bell, ChevronDown, Search, BarChart2, BookOpen, LayoutDashboard, Plus } from 'lucide-react';
import Link from 'next/link';
import { AuthButton } from './AuthButton';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export function Header() {
  const { data: session } = useSession();
  const [favCount, setFavCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [adminNotifications, setAdminNotifications] = useState({
    newUsers: 0,
    unverifiedUsers: 0,
    pendingProperties: 0,
    featureRequests: 0,
    unreadMessages: 0,
    openReports: 0,
  });
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);

  useEffect(() => {
    if (session?.user?.role === 'TENANT') {
      fetchFavoritesCount();
      fetchUnreadMessages();
      
      // Poll for new messages every 30 seconds
      const interval = setInterval(fetchUnreadMessages, 30000);
      return () => clearInterval(interval);
    } else if (session?.user?.role === 'LANDLORD') {
      fetchUnreadMessages();
      
      // Poll for new messages every 30 seconds
      const interval = setInterval(fetchUnreadMessages, 30000);
      return () => clearInterval(interval);
    } else if (session?.user?.role === 'ADMIN') {
      fetchAdminNotifications();
      
      // Poll for admin notifications every 30 seconds
      const interval = setInterval(fetchAdminNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // avatar for navbar links removed — profile image is shown in account dropdown instead

  const fetchFavoritesCount = async () => {
    try {
      const res = await fetch('/api/favorites');
      const data = await res.json();
      setFavCount(Array.isArray(data) ? data.length : 0);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      const [propRes, roommateRes] = await Promise.all([
        fetch('/api/messages'),
        fetch('/api/roommate/messages?inbox=true'),
      ]);
      const [propData, roommateData] = await Promise.all([
        propRes.json(),
        roommateRes.json(),
      ]);

      const propUnread = Array.isArray(propData)
        ? propData.reduce((count: number, conv: any) => {
            const unread = conv.messages?.filter((msg: any) => msg.receiverId === session?.user?.id && msg.status !== 'READ')?.length || 0;
            return count + unread;
          }, 0)
        : 0;

      const roommateUnread = Array.isArray(roommateData)
        ? roommateData.reduce((count: number, conv: any) => count + (conv.unreadCount || 0), 0)
        : 0;

      setUnreadMessages(propUnread + roommateUnread);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  const fetchAdminNotifications = async () => {
    try {
      // Fetch all users to get new users count
      const usersRes = await fetch('/api/admin/users');
      const users = await usersRes.json();
      
      // Count new unverified users (created in last 7 days AND not verified)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const newUsers = Array.isArray(users) ? users.filter((u: any) => new Date(u.createdAt) > sevenDaysAgo && !u.verificationStatus).length : 0;
      
      // Count unverified users
      const unverifiedUsers = Array.isArray(users) ? users.filter((u: any) => !u.verificationStatus).length : 0;

      // Fetch pending properties
      const propsRes = await fetch('/api/admin/properties');
      const properties = await propsRes.json();
      const pendingProperties = Array.isArray(properties) ? properties.filter((p: any) => p.status === 'PENDING').length : 0;
      const featureRequests = Array.isArray(properties) ? properties.filter((p: any) => p.featureRequested).length : 0;

      // Fetch unread messages
      const messagesRes = await fetch('/api/messages');
      const messages = await messagesRes.json();
      let unreadCount = 0;
      if (Array.isArray(messages)) {
        unreadCount = messages.reduce((count: number, conv: any) => {
          const unread = conv.messages?.filter((msg: any) => msg.receiverId === session?.user?.id && msg.status !== 'READ')?.length || 0;
          return count + unread;
        }, 0);
      }

      // Fetch open reports
      const reportsRes = await fetch('/api/admin/reports');
      const reports = await reportsRes.json();
      const openReports = Array.isArray(reports) ? reports.filter((r: any) => r.status === 'OPEN' || r.status === 'PENDING').length : 0;

      setAdminNotifications({
        newUsers,
        unverifiedUsers,
        pendingProperties,
        featureRequests,
        unreadMessages: unreadCount,
        openReports,
      });
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
    }
  };

  const totalAdminNotifications = Object.values(adminNotifications).reduce((a, b) => a + b, 0);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">RentALot</h1>
              <p className="text-sm text-gray-600">Find Your Dream Home</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/browse" className="flex items-center gap-1.5 text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              <Search className="w-4 h-4" />Browse
            </Link>
            <Link href="/compare" className="flex items-center gap-1.5 text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              <BarChart2 className="w-4 h-4" />Compare
            </Link>
            <Link href="/blog" className="flex items-center gap-1.5 text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              <BookOpen className="w-4 h-4" />Blog
            </Link>
            {session?.user?.role === 'ADMIN' && (
              <Link href="/admin/dashboard" className="flex items-center gap-1.5 text-gray-700 hover:text-purple-600 font-medium transition-colors">
                <LayoutDashboard className="w-4 h-4" />Dashboard
              </Link>
            )}
            {session?.user?.role === 'TENANT' && (
              <>
                <Link href="/tenant/dashboard" className="flex items-center gap-1.5 text-gray-700 hover:text-emerald-600 font-medium transition-colors">
                  <LayoutDashboard className="w-4 h-4" />Dashboard
                </Link>
                <Link
                  href="/tenant/messages"
                  className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 font-medium transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </Link>
                <Link
                  href="/tenant/favorites"
                  className="flex items-center gap-2 text-gray-700 hover:text-red-600 font-medium transition-colors relative"
                >
                  <Heart className="w-5 h-5" />
                  <span>{favCount}</span>
                </Link>
              </>
            )}
            {session?.user?.role === 'LANDLORD' && (
              <div className="flex items-center gap-3">
                <Link
                  href="/landlord/properties/new"
                  className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />Add Property
                </Link>
                <Link
                  href="/landlord/dashboard"
                  className="flex items-center gap-1.5 text-gray-700 hover:text-emerald-600 font-medium transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />Dashboard
                </Link>
                <Link
                  href="/landlord/messages"
                  className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 font-medium transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </Link>
              </div>
            )}
            {session?.user?.role === 'ADMIN' && (
              <div className="relative">
                <button
                  onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                  className="flex items-center gap-2 text-gray-700 hover:text-purple-600 font-medium transition-colors relative px-3 py-1 rounded-lg hover:bg-gray-100"
                >
                  <Bell className="w-5 h-5" />
                  {totalAdminNotifications > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {totalAdminNotifications > 9 ? '9+' : totalAdminNotifications}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showAdminDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 space-y-3">
                      <Link
                        href="/admin/users"
                        onClick={() => setShowAdminDropdown(false)}
                        className="flex items-center justify-between p-2 hover:bg-green-50 rounded-lg transition-colors group"
                      >
                        <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">👥 New Users</span>
                        {adminNotifications.newUsers > 0 && (
                          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {adminNotifications.newUsers > 9 ? '9+' : adminNotifications.newUsers}
                          </span>
                        )}
                      </Link>

                      <Link
                        href="/admin/users"
                        onClick={() => setShowAdminDropdown(false)}
                        className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                      >
                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">⚠️ Unverified Users</span>
                        {adminNotifications.unverifiedUsers > 0 && (
                          <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {adminNotifications.unverifiedUsers > 9 ? '9+' : adminNotifications.unverifiedUsers}
                          </span>
                        )}
                      </Link>

                      <Link
                        href="/admin/properties"
                        onClick={() => setShowAdminDropdown(false)}
                        className="flex items-center justify-between p-2 hover:bg-purple-50 rounded-lg transition-colors group"
                      >
                        <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">🏠 New Listings</span>
                        {adminNotifications.pendingProperties > 0 && (
                          <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {adminNotifications.pendingProperties > 9 ? '9+' : adminNotifications.pendingProperties}
                          </span>
                        )}
                      </Link>

                      <Link
                        href="/admin/properties"
                        onClick={() => setShowAdminDropdown(false)}
                        className="flex items-center justify-between p-2 hover:bg-amber-50 rounded-lg transition-colors group"
                      >
                        <span className="text-sm font-medium text-gray-700 group-hover:text-amber-600">⭐ Feature Requests</span>
                        {adminNotifications.featureRequests > 0 && (
                          <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {adminNotifications.featureRequests > 9 ? '9+' : adminNotifications.featureRequests}
                          </span>
                        )}
                      </Link>

                      <Link
                        href="/admin/messages"
                        onClick={() => setShowAdminDropdown(false)}
                        className="flex items-center justify-between p-2 hover:bg-amber-50 rounded-lg transition-colors group"
                      >
                        <span className="text-sm font-medium text-gray-700 group-hover:text-amber-600">💬 Messages</span>
                        {adminNotifications.unreadMessages > 0 && (
                          <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {adminNotifications.unreadMessages > 9 ? '9+' : adminNotifications.unreadMessages}
                          </span>
                        )}
                      </Link>

                      <Link
                        href="/admin/reports"
                        onClick={() => setShowAdminDropdown(false)}
                        className="flex items-center justify-between p-2 hover:bg-red-50 rounded-lg transition-colors group"
                      >
                        <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">🚩 Reported Content</span>
                        {adminNotifications.openReports > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {adminNotifications.openReports > 9 ? '9+' : adminNotifications.openReports}
                          </span>
                        )}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          <AuthButton />
        </div>
      </div>
    </header>
  );
}
