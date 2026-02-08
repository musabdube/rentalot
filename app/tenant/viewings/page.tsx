'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, MapPin, Phone, Mail, Check, X, AlertCircle, MessageCircle } from 'lucide-react';
import { ReportFraudModal } from '@/app/components/ReportFraudModal';
import { ViewingMessages } from '@/app/components/ViewingMessages';

interface Viewing {
  id: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  preferredDate: string;
  preferredTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  property: {
    id: string;
    title: string;
    location: string;
    landlord?: {
      id: string;
      name: string;
    };
  };
  createdAt: string;
}

export default function ViewingsPage() {
  const { data: session, status } = useSession();
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportingProperty, setReportingProperty] = useState<{ id: string; title: string } | null>(null);
  const [selectedViewingForChat, setSelectedViewingForChat] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<Viewing['status'], boolean>>({
    PENDING: false,
    CONFIRMED: false,
    CANCELLED: false,
    COMPLETED: true,
  });

  // Fetch viewings on mount
  useEffect(() => {
    const fetchViewings = async () => {
      try {
        const response = await fetch('/api/viewings');
        const data = await response.json();
        // Ensure data is an array, default to empty array if not
        setViewings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch viewings:', error);
        setViewings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchViewings();
  }, []);

  // Check authentication - this must happen after all hooks
  if (status === 'loading') {
    return <div className="p-8">Loading...</div>;
  }

  if (!session || session.user?.role !== 'TENANT') {
    redirect('/auth/signin');
  }

  const sortByDate = (a: Viewing, b: Viewing) => {
    const aDate = new Date(a.preferredDate || a.createdAt).getTime();
    const bDate = new Date(b.preferredDate || b.createdAt).getTime();
    return aDate - bDate;
  };

  const groupedViewings = {
    PENDING: viewings.filter((v) => v.status === 'PENDING').sort(sortByDate),
    CONFIRMED: viewings.filter((v) => v.status === 'CONFIRMED').sort(sortByDate),
    CANCELLED: viewings.filter((v) => v.status === 'CANCELLED').sort(sortByDate),
    COMPLETED: viewings.filter((v) => v.status === 'COMPLETED').sort(sortByDate),
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
    };

    const labels = {
      PENDING: 'Pending Confirmation',
      CONFIRMED: 'Confirmed',
      CANCELLED: 'Cancelled',
      COMPLETED: 'Completed',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Viewings */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading viewings...</p>
          </div>
        ) : viewings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No viewings scheduled</h3>
            <p className="text-gray-600">
              You haven't scheduled any apartment viewings yet. Browse properties and schedule a viewing!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {(['PENDING', 'CONFIRMED', 'CANCELLED'] as const).map((statusKey) => (
              <section key={statusKey} className="bg-white rounded-xl shadow-sm border border-gray-100">
                <button
                  type="button"
                  onClick={() => setCollapsed((prev) => ({ ...prev, [statusKey]: !prev[statusKey] }))}
                  className="w-full px-5 py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-gray-900">
                      {statusKey === 'PENDING'
                        ? 'Pending'
                        : statusKey === 'CONFIRMED'
                          ? 'Confirmed'
                          : 'Cancelled'}
                    </span>
                    <span className="text-sm text-gray-500">({groupedViewings[statusKey].length})</span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {collapsed[statusKey] ? 'Show' : 'Hide'}
                  </span>
                </button>

                {!collapsed[statusKey] && (
                  <div className="px-5 pb-5 space-y-6">
                    {groupedViewings[statusKey].length === 0 ? (
                      <div className="text-sm text-gray-500">No {statusKey.toLowerCase()} viewings.</div>
                    ) : (
                      groupedViewings[statusKey].map((viewing) => (
                        <div
                          key={viewing.id}
                          className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100"
                        >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{viewing.property.title}</h3>
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{viewing.property.location}</span>
                    </div>
                  </div>
                  {getStatusBadge(viewing.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Viewing Date</p>
                      <p className="font-semibold text-gray-900">{viewing.preferredDate}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <Clock className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-semibold text-gray-900">{viewing.preferredTime}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900 break-all">{viewing.visitorEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{viewing.visitorPhone}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Scheduled</p>
                    <p className="font-medium text-gray-900">
                      {new Date(viewing.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {viewing.status === 'PENDING' && (
                  <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
                    <button className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-2">
                      <X className="w-4 h-4" />
                      Cancel Viewing
                    </button>
                  </div>
                )}

                {viewing.status === 'CONFIRMED' && viewing.property.landlord && (
                  <button
                    onClick={() => setSelectedViewingForChat(viewing.id)}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 py-2 rounded-lg font-medium hover:bg-emerald-200 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message {viewing.property.landlord.name}
                  </button>
                )}

                <button
                  onClick={() => setReportingProperty({ id: viewing.property.id, title: viewing.property.title })}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors"
                >
                  <AlertCircle className="w-4 h-4" />
                  Report Fraud
                </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </section>
            ))}

            {groupedViewings.COMPLETED.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100">
                <button
                  type="button"
                  onClick={() => setCollapsed((prev) => ({ ...prev, COMPLETED: !prev.COMPLETED }))}
                  className="w-full px-5 py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-gray-900">Completed</span>
                    <span className="text-sm text-gray-500">({groupedViewings.COMPLETED.length})</span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {collapsed.COMPLETED ? 'Show' : 'Hide'}
                  </span>
                </button>

                {!collapsed.COMPLETED && (
                  <div className="px-5 pb-5 space-y-6">
                    {groupedViewings.COMPLETED.map((viewing) => (
                      <div
                        key={viewing.id}
                        className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{viewing.property.title}</h3>
                            <div className="flex items-center gap-2 text-gray-600 mt-1">
                              <MapPin className="w-4 h-4" />
                              <span>{viewing.property.location}</span>
                            </div>
                          </div>
                          {getStatusBadge(viewing.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
                          <div className="flex items-start gap-3">
                            <div className="bg-emerald-50 p-3 rounded-lg">
                              <Calendar className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Viewing Date</p>
                              <p className="font-semibold text-gray-900">{viewing.preferredDate}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="bg-emerald-50 p-3 rounded-lg">
                              <Clock className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Time</p>
                              <p className="font-semibold text-gray-900">{viewing.preferredTime}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-sm text-gray-600">Email</p>
                              <p className="font-medium text-gray-900 break-all">{viewing.visitorEmail}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">Phone</p>
                              <p className="font-medium text-gray-900">{viewing.visitorPhone}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600">Scheduled</p>
                            <p className="font-medium text-gray-900">
                              {new Date(viewing.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>

      {reportingProperty && (
        <ReportFraudModal
          propertyId={reportingProperty.id}
          propertyTitle={reportingProperty.title}
          onClose={() => setReportingProperty(null)}
        />
      )}

      {/* Messaging Modal */}
      {selectedViewingForChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold">Chat</h2>
              <button
                onClick={() => setSelectedViewingForChat(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              {viewings.find((v) => v.id === selectedViewingForChat) && (
                <ViewingMessages
                  viewingId={selectedViewingForChat}
                  otherUserId={
                    viewings.find((v) => v.id === selectedViewingForChat)?.property.landlord?.id || ''
                  }
                  otherUserName={
                    viewings.find((v) => v.id === selectedViewingForChat)?.property.landlord?.name || ''
                  }
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
