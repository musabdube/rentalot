'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, MapPin, Phone, Mail, Check, X, MessageCircle } from 'lucide-react';
import { ViewingMessages } from '@/app/components/ViewingMessages';

interface ViewingRequest {
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
    location?: string;
    city?: string;
    suburb?: string;
  };
  tenant: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function ViewingRequestsPage() {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<ViewingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('pending');
  const [selectedViewingForChat, setSelectedViewingForChat] = useState<string | null>(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [properties, setProperties] = useState<Array<{ id: string; title: string }>>([]);
  const [slotForm, setSlotForm] = useState({ propertyId: '', date: '', startTime: '', endTime: '' });

  useEffect(() => {
    // fetch landlord properties for availability management
    const fetchProperties = async () => {
      try {
        const res = await fetch('/api/landlord/properties');
        if (res.ok) {
          const data = await res.json();
          setProperties(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to fetch landlord properties', err);
      }
    };

    fetchProperties();
  }, []);

  // Fetch requests on mount
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/viewings');
        const data = await response.json();
        setRequests(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Check authentication - this must happen after all hooks
  if (status === 'loading') {
    return <div className="p-8">Loading...</div>;
  }

  if (!session || session.user?.role !== 'LANDLORD') {
    redirect('/auth/signin');
  }

  const filteredRequests = requests.filter((request) => {
    if (filter === 'all') return true;
    return request.status.toLowerCase() === filter;
  });

  const handleConfirm = async (viewingId: string) => {
    try {
      const response = await fetch(`/api/viewings?id=${viewingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });

      if (response.ok) {
        setRequests(
          requests.map((r) =>
            r.id === viewingId ? { ...r, status: 'CONFIRMED' } : r
          )
        );
      }
    } catch (error) {
      console.error('Failed to confirm viewing:', error);
    }
  };

  const handleCancel = async (viewingId: string) => {
    try {
      const response = await fetch(`/api/viewings?id=${viewingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (response.ok) {
        setRequests(
          requests.map((r) =>
            r.id === viewingId ? { ...r, status: 'CANCELLED' } : r
          )
        );
      }
    } catch (error) {
      console.error('Failed to cancel viewing:', error);
    }
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
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/landlord/dashboard"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Viewing Requests</h1>
              <p className="text-gray-600 mt-1">Manage scheduled apartment viewings</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAvailabilityModal(true)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700"
              >
                Manage Availability
              </button>
              <div className="bg-emerald-100 p-3 rounded-lg">
              <Calendar className="w-8 h-8 text-emerald-600" />
            </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Availability Modal */}
        {showAvailabilityModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create Availability Slot</h3>
                <button onClick={() => setShowAvailabilityModal(false)} className="text-gray-500">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
                  <select value={slotForm.propertyId} onChange={(e) => setSlotForm({ ...slotForm, propertyId: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                    <option value="">Select property</option>
                    {properties.map(p => (<option key={p.id} value={p.id}>{p.title}</option>))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input type="date" value={slotForm.date} onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input type="time" value={slotForm.startTime} onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <input type="time" value={slotForm.endTime} onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/viewings/slots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(slotForm) });
                        if (res.ok) {
                          setShowAvailabilityModal(false);
                          setSlotForm({ propertyId: '', date: '', startTime: '', endTime: '' });
                        } else {
                          const err = await res.json();
                          console.error(err);
                        }
                      } catch (err) {
                        console.error('Failed to create slot', err);
                      }
                    }}
                    className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg"
                  >
                    Create Slot
                  </button>
                  <button onClick={() => setShowAvailabilityModal(false)} className="flex-1 bg-gray-200 px-4 py-2 rounded-lg">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          {['all', 'pending', 'confirmed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Requests Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No viewing requests</h3>
            <p className="text-gray-600">You don't have any viewing requests yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{request.property.title}</h3>
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{request.property.suburb || request.property.city}, {request.property.city}</span>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                {/* Viewing Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Preferred Date</p>
                      <p className="font-semibold text-gray-900">{request.preferredDate}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <Clock className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Preferred Time</p>
                      <p className="font-semibold text-gray-900">{request.preferredTime}</p>
                    </div>
                  </div>
                </div>

                {/* Visitor Information */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Visitor Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="text-gray-400 mt-0.5">
                        <span className="font-medium text-gray-900">{request.visitorName}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-600">Email</p>
                        <a
                          href={`mailto:${request.visitorEmail}`}
                          className="font-medium text-emerald-600 hover:text-emerald-700 break-all"
                        >
                          {request.visitorEmail}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <a
                          href={`tel:${request.visitorPhone}`}
                          className="font-medium text-emerald-600 hover:text-emerald-700"
                        >
                          {request.visitorPhone}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {request.status === 'PENDING' && (
                  <div className="pt-6 border-t border-gray-200 flex gap-3">
                    <button
                      onClick={() => handleConfirm(request.id)}
                      className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Confirm Viewing
                    </button>
                    <button
                      onClick={() => handleCancel(request.id)}
                      className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel Request
                    </button>
                  </div>
                )}

                {request.status === 'CONFIRMED' && (
                  <button
                    onClick={() => setSelectedViewingForChat(request.id)}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 py-2 rounded-lg font-medium hover:bg-emerald-200 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message {request.tenant.name}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

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
              {requests.find((r) => r.id === selectedViewingForChat) && (
                <ViewingMessages
                  viewingId={selectedViewingForChat}
                  otherUserId={
                    requests.find((r) => r.id === selectedViewingForChat)?.tenant.id || ''
                  }
                  otherUserName={
                    requests.find((r) => r.id === selectedViewingForChat)?.tenant.name || ''
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
