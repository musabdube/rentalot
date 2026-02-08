'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Home,
  MapPin,
  Eye,
  Trash2,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { RentalRequest, RentalRequestStatus } from '@/app/types/rentalRequest';

type StatusFilter = 'all' | RentalRequestStatus;

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
  APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
  REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
  COMPLETED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Completed' },
  CANCELLED: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'Cancelled' },
};

export default function TenantRequestsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedRequest, setSelectedRequest] = useState<RentalRequest | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'loading') {
      return;
    }

    if (!session || session.user?.role !== 'TENANT') {
      router.push('/auth/signin');
      return;
    }

    fetchRequests();
  }, [session, sessionStatus, router]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (response.ok) {
        await fetchRequests();
        setSelectedRequest(null);
        toast.success('Request cancelled successfully');
      } else {
        toast.error('Failed to cancel request');
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error('Error cancelling request');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests =
    statusFilter === 'all'
      ? requests
      : requests.filter((r) => r.status === statusFilter);

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Rental Requests</h1>
            <p className="text-gray-600">Track and manage your property rental applications</p>
          </div>
          <Link
            href="/"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Browse Properties
          </Link>
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {(['all', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all'
                    ? 'All Requests'
                    : statusConfig[status as RentalRequestStatus].label}
                  {` (${requests.filter((r) => status === 'all' || r.status === status).length})`}
                </button>
              )
            )}
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Requests</h2>
            <p className="text-gray-600 mb-6">
              {requests.length === 0
                ? 'When you apply for a property, your requests will appear here.'
                : 'No requests match the selected filter.'}
            </p>
            {requests.length === 0 && (
              <Link
                href="/"
                className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Browse Properties
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const statusConf = statusConfig[request.status];
              if (!statusConf) return null;
              
              const StatusIconComponent = statusConf.icon;
              const moveInDate = new Date(request.moveInDate).toLocaleDateString();
              const propertyImage = request.property.images?.find((img) => img.isMain)?.url;

              return (
                <div
                  key={request.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Property Image */}
                    {propertyImage && (
                      <div className="md:w-48 h-40 flex-shrink-0">
                        <img
                          src={propertyImage}
                          alt={request.property.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* Request Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {request.property.title}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-600 mt-1">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {[request.property.suburb, request.property.city]
                                .filter(Boolean)
                                .join(', ')}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                            statusConf.color
                          }`}
                        >
                          <StatusIconComponent className="w-4 h-4" />
                          <span className="text-sm font-semibold">
                            {statusConf.label}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Monthly Rent</p>
                          <p className="text-lg font-semibold text-gray-900">
                            ${request.property.rentAmount.toLocaleString()} {request.property.currency}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Move-in Date</p>
                          <p className="text-lg font-semibold text-gray-900">{moveInDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Request Date</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Landlord</p>
                          <p className="text-lg font-semibold text-gray-900">{request.tenant.name}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => router.push(`/tenant/messages?requestId=${request.id}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Messages
                        </button>
                        {request.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelRequest(request.id)}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Property Info */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Property</h3>
                <div className="space-y-3">
                  <p>
                    <span className="text-gray-600">Title:</span>{' '}
                    <span className="font-semibold text-gray-900">
                      {selectedRequest.property.title}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Location:</span>{' '}
                    <span className="font-semibold text-gray-900">
                      {[selectedRequest.property.street, selectedRequest.property.suburb, selectedRequest.property.city]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Monthly Rent:</span>{' '}
                    <span className="font-semibold text-gray-900">
                      ${selectedRequest.property.rentAmount.toLocaleString()}{' '}
                      {selectedRequest.property.currency}
                    </span>
                  </p>
                </div>
              </div>

              {/* Request Timeline */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Timeline</h3>
                <div className="space-y-3">
                  <p>
                    <span className="text-gray-600">Request Date:</span>{' '}
                    <span className="font-semibold text-gray-900">
                      {new Date(selectedRequest.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Move-in Date:</span>{' '}
                    <span className="font-semibold text-gray-900">
                      {new Date(selectedRequest.moveInDate).toLocaleDateString()}
                    </span>
                  </p>
                  {selectedRequest.moveOutDate && (
                    <p>
                      <span className="text-gray-600">Move-out Date:</span>{' '}
                      <span className="font-semibold text-gray-900">
                        {new Date(selectedRequest.moveOutDate).toLocaleDateString()}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Status</h3>
                {statusConfig[selectedRequest.status] && (
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                      statusConfig[selectedRequest.status].color
                    }`}
                  >
                    {statusConfig[selectedRequest.status] && (
                      <>
                        {(() => {
                          const Icon = statusConfig[selectedRequest.status].icon;
                          return <Icon className="w-5 h-5" />;
                        })()}
                        <span className="font-semibold">
                          {statusConfig[selectedRequest.status].label}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {selectedRequest.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => router.push(`/tenant/messages?requestId=${selectedRequest.id}`)}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Contact Landlord
                    </button>
                    <button
                      onClick={() => {
                        handleCancelRequest(selectedRequest.id);
                      }}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Cancel Request
                    </button>
                  </>
                )}
                {selectedRequest.status !== 'PENDING' && (
                  <button
                    onClick={() => router.push(`/tenant/messages?requestId=${selectedRequest.id}`)}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Send Message
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
