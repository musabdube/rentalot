'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  Home,
  Eye,
  MessageSquare,
  Mail,
  Phone,
  ChevronDown,
} from 'lucide-react';
import { useEffect, useState } from 'react';
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

export default function LandlordRequestsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedRequest, setSelectedRequest] = useState<RentalRequest | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'loading') {
      return;
    }

    if (!session || session.user?.role !== 'LANDLORD') {
      router.push('/auth/signin');
      return;
    }

    fetchRequests();
  }, [session, sessionStatus, router]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/landlord/requests');
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

  const handleApprove = async (requestId: string) => {
    if (!confirm('Are you sure you want to approve this rental request?')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/landlord/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });

      if (response.ok) {
        await fetchRequests();
        setSelectedRequest(null);
        toast.success('Rental request approved successfully!');
      } else {
        toast.error('Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Error approving request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!confirm('Are you sure you want to reject this rental request?')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/landlord/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
      });

      if (response.ok) {
        await fetchRequests();
        setSelectedRequest(null);
        toast.success('Rental request rejected');
      } else {
        toast.error('Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Error rejecting request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: RentalRequestStatus) => {
    if (!selectedRequest) return;
    
    if (!confirm(`Are you sure you want to update this request to ${statusConfig[newStatus].label}?`)) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/landlord/requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchRequests();
        // Update the local selectedRequest to reflect the new status
        setSelectedRequest(prev => prev ? { ...prev, status: newStatus } : null);
        setShowStatusDropdown(false);
        toast.success(`Request status updated to ${statusConfig[newStatus].label}`);
      } else {
        toast.error('Failed to update request status');
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Error updating request status');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests =
    statusFilter === 'all'
      ? requests
      : requests.filter((req) => req.status === statusFilter);

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'PENDING').length,
    approved: requests.filter((r) => r.status === 'APPROVED').length,
    rejected: requests.filter((r) => r.status === 'REJECTED').length,
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/landlord/dashboard"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Rental Requests</h1>
          <p className="text-gray-600 mt-1">Manage tenant rental applications and applications</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm font-medium">Total Requests</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm font-medium">Pending</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm font-medium">Approved</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm font-medium">Rejected</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-x-auto">
          <div className="flex flex-nowrap">
            {(['all', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'] as StatusFilter[]).map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`flex-shrink-0 px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
                    statusFilter === filter
                      ? 'border-emerald-600 text-emerald-600 bg-emerald-50'
                      : 'border-transparent text-gray-600 hover:text-emerald-600'
                  }`}
                >
                  {filter === 'all' ? 'All Requests' : statusConfig[filter].label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Requests</h2>
            <p className="text-gray-600">
              {statusFilter === 'all'
                ? "You don't have any rental requests yet."
                : `No ${statusConfig[statusFilter].label.toLowerCase()} requests.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const StatusIcon = statusConfig[request.status].icon;
              const moveInDate = new Date(request.moveInDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={request.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {request.property.title}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                              statusConfig[request.status].color
                            }`}
                          >
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig[request.status].label}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm flex items-center gap-1">
                          <Home className="w-4 h-4" />
                          {[request.property.street, request.property.suburb, request.property.city]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">
                          ${request.property.rentAmount.toLocaleString()}
                        </p>
                        <p className="text-gray-600 text-sm">/month {request.property.currency}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
                      {/* Tenant Info */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Tenant
                        </h4>
                        <p className="font-semibold text-gray-900 text-sm">{request.tenant.name}</p>
                        <a
                          href={`mailto:${request.tenant.email}`}
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                        >
                          <Mail className="w-3 h-3" />
                          {request.tenant.email}
                        </a>
                        {request.tenant.phone && (
                          <a
                            href={`tel:${request.tenant.phone}`}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                          >
                            <Phone className="w-3 h-3" />
                            {request.tenant.phone}
                          </a>
                        )}
                      </div>

                      {/* Move-in Date */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Move-in Date
                        </h4>
                        <p className="font-semibold text-gray-900 text-sm">{moveInDate}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Requested {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Request ID & Date */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                          Request ID
                        </h4>
                        <p className="font-mono text-xs text-gray-900 break-all">{request.id.slice(0, 12)}...</p>
                      </div>

                      {/* Property Type */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                          Property Type
                        </h4>
                        <p className="font-semibold text-gray-900 text-sm capitalize">
                          {request.property.type}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>

                      <button
                        onClick={() =>
                          router.push(`/landlord/messages?requestId=${request.id}`)
                        }
                        className="flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-100 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </button>

                      {request.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(request.id)}
                            disabled={actionLoading}
                            className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            disabled={actionLoading}
                            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Property Details */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Property Details
                </h3>
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg p-4 space-y-2">
                  <p className="font-bold text-gray-900 text-lg">{selectedRequest.property.title}</p>
                  <p className="text-gray-600 text-sm">
                    {[
                      selectedRequest.property.street,
                      selectedRequest.property.suburb,
                      selectedRequest.property.city,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-emerald-200">
                    <div>
                      <p className="text-xs text-gray-600">Monthly Rent</p>
                      <p className="text-xl font-bold text-emerald-600">
                        ${selectedRequest.property.rentAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Type</p>
                      <p className="text-lg font-bold text-gray-900 capitalize">
                        {selectedRequest.property.type}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tenant Details */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Tenant Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    {selectedRequest.tenant.avatar && (
                      <img
                        src={selectedRequest.tenant.avatar}
                        alt={selectedRequest.tenant.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-bold text-gray-900">{selectedRequest.tenant.name}</p>
                      <p className="text-xs text-gray-600">
                        {selectedRequest.tenant.verificationStatus ? '✓ Verified' : 'Not Verified'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-3 border-t border-gray-200">
                    <a href={`mailto:${selectedRequest.tenant.email}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{selectedRequest.tenant.email}</span>
                    </a>
                    {selectedRequest.tenant.phone && (
                      <a href={`tel:${selectedRequest.tenant.phone}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{selectedRequest.tenant.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Tenant Submitted Information */}
              {(selectedRequest.tenantOccupation || selectedRequest.tenantIncome || selectedRequest.tenantEmployer || selectedRequest.tenantReferences || selectedRequest.tenantNotes) && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Tenant Submitted Information</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                    {selectedRequest.tenantOccupation && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Occupation</p>
                        <p className="text-gray-900">{selectedRequest.tenantOccupation}</p>
                      </div>
                    )}
                    {selectedRequest.tenantIncome && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Monthly Income</p>
                        <p className="text-gray-900">{selectedRequest.tenantIncome}</p>
                      </div>
                    )}
                    {selectedRequest.tenantEmployer && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Employer</p>
                        <p className="text-gray-900">{selectedRequest.tenantEmployer}</p>
                      </div>
                    )}
                    {selectedRequest.tenantReferences && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">References</p>
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedRequest.tenantReferences}</p>
                      </div>
                    )}
                    {selectedRequest.tenantNotes && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Additional Notes</p>
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedRequest.tenantNotes}</p>
                      </div>
                    )}
                    {selectedRequest.tenantPhone && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Phone Number</p>
                        <a href={`tel:${selectedRequest.tenantPhone}`} className="text-blue-600 hover:text-blue-700">{selectedRequest.tenantPhone}</a>
                      </div>
                    )}
                    {selectedRequest.tenantEmail && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Contact Email</p>
                        <a href={`mailto:${selectedRequest.tenantEmail}`} className="text-blue-600 hover:text-blue-700">{selectedRequest.tenantEmail}</a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Request Timeline */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Timeline
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p>
                    <span className="font-medium text-gray-700">Request Date:</span>{' '}
                    <span className="text-gray-900">
                      {new Date(selectedRequest.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Move-in Date:</span>{' '}
                    <span className="text-gray-900">
                      {new Date(selectedRequest.moveInDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </p>
                  {selectedRequest.moveOutDate && (
                    <p>
                      <span className="font-medium text-gray-700">Move-out Date:</span>{' '}
                      <span className="text-gray-900">
                        {new Date(selectedRequest.moveOutDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Status with Dropdown */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Status</h3>
                <div className="relative inline-block">
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors ${
                      statusConfig[selectedRequest.status].color
                    } border-2 border-current hover:opacity-80`}
                  >
                    <StatusIcon status={selectedRequest.status} />
                    {statusConfig[selectedRequest.status].label}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </button>

                  {/* Dropdown Menu */}
                  {showStatusDropdown && (
                    <div className="absolute top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'] as RentalRequestStatus[]).map(
                        (status) => (
                          status !== selectedRequest.status && (
                            <button
                              key={status}
                              onClick={() => handleUpdateStatus(status)}
                              disabled={actionLoading}
                              className={`w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
                                statusConfig[status].color
                              }`}
                            >
                              <StatusIcon status={status} />
                              {statusConfig[status].label}
                            </button>
                          )
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedRequest.status === 'PENDING' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {actionLoading ? 'Approving...' : 'Approve Request'}
                  </button>
                  <button
                    onClick={() => handleReject(selectedRequest.id)}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    {actionLoading ? 'Rejecting...' : 'Reject Request'}
                  </button>
                </div>
              )}

              <button
                onClick={() => setSelectedRequest(null)}
                className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const StatusIcon = ({ status }: { status: RentalRequestStatus }) => {
  const Icon = statusConfig[status].icon;
  return <Icon className="w-5 h-5" />;
};
