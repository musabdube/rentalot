'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, AlertCircle, CheckCircle, Trash2, Eye, Flag } from 'lucide-react';
import { useEffect, useState } from 'react';import toast from 'react-hot-toast';
interface Report {
  id: string;
  type: string;
  reason: string;
  description?: string;
  status: string;
  reporter: {
    name: string;
    email: string;
  };
  property?: {
    id: string;
    title: string;
    location: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    area: number;
    type: string;
    landlord: {
      id: string;
      name: string;
    };
    images: Array<{
      id: string;
      url: string;
      isMain: boolean;
      caption?: string;
    }>;
  };
  reportedUser?: {
    name: string;
    email: string;
  };
  adminNotes?: string;
  createdAt: string;
}

type StatusFilter = 'all' | 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED' | 'ACTION_TAKEN';
type TypeFilter = 'all' | 'SCAM' | 'SPAM' | 'FAKE_LISTING' | 'INAPPROPRIATE' | 'FAKE_PROFILE' | 'OTHER';

const statusConfig: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'bg-red-100 text-red-800', label: 'Pending' },
  INVESTIGATING: { color: 'bg-yellow-100 text-yellow-800', label: 'Investigating' },
  RESOLVED: { color: 'bg-green-100 text-green-800', label: 'Resolved' },
  DISMISSED: { color: 'bg-gray-100 text-gray-800', label: 'Dismissed' },
  ACTION_TAKEN: { color: 'bg-blue-100 text-blue-800', label: 'Action Taken' },
};

const typeConfig: Record<string, { color: string; label: string; icon: string }> = {
  SCAM: { color: 'bg-red-50', label: 'Scam', icon: '🚨' },
  SPAM: { color: 'bg-orange-50', label: 'Spam', icon: '🔔' },
  FAKE_LISTING: { color: 'bg-yellow-50', label: 'Fake Listing', icon: '❌' },
  INAPPROPRIATE: { color: 'bg-pink-50', label: 'Inappropriate', icon: '⚠️' },
  FAKE_PROFILE: { color: 'bg-purple-50', label: 'Fake Profile', icon: '👤' },
  OTHER: { color: 'bg-gray-50', label: 'Other', icon: '❓' },
};

export default function AdminReportsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'loading') {
      return;
    }

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/auth/signin');
      return;
    }

    fetchReports();
  }, [session, sessionStatus, router]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminNotes }),
      });

      if (response.ok) {
        await fetchReports();
        setSelectedReport(null);
        setEditMode(false);
        toast.success('Report updated');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Error updating report');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Delete this report? This cannot be undone.')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReports(reports.filter(r => r.id !== reportId));
        setSelectedReport(null);
        toast.success('Report deleted');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Error deleting report');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Delete this property listing? This action cannot be undone.')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Property deleted successfully');
        setSelectedReport(null);
        await fetchReports();
      } else {
        toast.error('Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Error deleting property');
    } finally {
      setActionLoading(false);
    }
  };

  const handleContactLandlord = async () => {
    if (!selectedReport?.property) return;
    
    if (!contactMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setContactLoading(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rentalRequestId: `admin-report-${selectedReport.id}`,
          receiverId: selectedReport.property.landlord.id,
          content: `[ADMIN MESSAGE] Report #${selectedReport.id.slice(0, 8)}\n\nReason: ${selectedReport.reason}\n\nMessage from Admin:\n${contactMessage}`,
        }),
      });

      if (response.ok) {
        toast.success('Message sent to landlord');
        setContactMessage('');
        setShowContactModal(false);
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
    } finally {
      setContactLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch =
      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporter.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'PENDING').length,
    investigating: reports.filter(r => r.status === 'INVESTIGATING').length,
    resolved: reports.filter(r => r.status === 'RESOLVED').length,
  };

  if (sessionStatus === 'loading' || loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><Flag className="w-7 h-7 text-emerald-600" />Reported Content</h1>
          <p className="text-gray-600 mt-1">Review and manage user reports for scams, spam, and inappropriate content</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Total Reports</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-3xl font-bold text-red-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Investigating</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.investigating}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Resolved</p>
            <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISMISSED">Dismissed</option>
              <option value="ACTION_TAKEN">Action Taken</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Types</option>
              <option value="SCAM">Scam</option>
              <option value="SPAM">Spam</option>
              <option value="FAKE_LISTING">Fake Listing</option>
              <option value="INAPPROPRIATE">Inappropriate</option>
              <option value="FAKE_PROFILE">Fake Profile</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600">No reports found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className={`rounded-xl shadow-sm p-6 ${typeConfig[report.type]?.color || 'bg-gray-50'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-3xl">{typeConfig[report.type]?.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{typeConfig[report.type]?.label || report.type}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusConfig[report.status]?.color || 'bg-gray-100'}`}>
                          {statusConfig[report.status]?.label || report.status}
                        </span>
                      </div>
                      <p className="text-gray-700 font-medium mb-1">{report.reason}</p>
                      {report.description && (
                        <p className="text-gray-600 text-sm mb-2">{report.description}</p>
                      )}
                      <p className="text-gray-600 text-sm">
                        Reported by <span className="font-medium">{report.reporter.name}</span> on {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                      {report.property && (
                        <p className="text-gray-600 text-sm">
                          Related to: <button
                            onClick={() => {
                              setSelectedReport(report);
                              setShowPropertyDetails(true);
                              setAdminNotes(report.adminNotes || '');
                            }}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {report.property.title}
                          </button>
                        </p>
                      )}
                      {report.reportedUser && (
                        <p className="text-gray-600 text-sm">
                          User reported: <span className="font-medium">{report.reportedUser.name}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedReport(report);
                      setAdminNotes(report.adminNotes || '');
                      setEditMode(false);
                    }}
                    className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Review
                  </button>

                  {report.status === 'PENDING' && (
                    <button
                      onClick={() => handleStatusUpdate(report.id, 'INVESTIGATING')}
                      disabled={actionLoading}
                      className="flex-1 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg font-medium hover:bg-yellow-200 transition-colors disabled:opacity-50"
                    >
                      Investigate
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(report.id)}
                    disabled={actionLoading}
                    className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{typeConfig[selectedReport.type]?.icon}</span>
                <h2 className="text-2xl font-bold text-gray-900">Report Details</h2>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-gray-500">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Type</p>
                <p className="text-gray-900">{typeConfig[selectedReport.type]?.label || selectedReport.type}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700">Status</p>
                {editMode ? (
                  <select
                    value={selectedReport.status}
                    onChange={(e) => setSelectedReport({ ...selectedReport, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="INVESTIGATING">Investigating</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="DISMISSED">Dismissed</option>
                    <option value="ACTION_TAKEN">Action Taken</option>
                  </select>
                ) : (
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusConfig[selectedReport.status]?.color || 'bg-gray-100'}`}>
                    {statusConfig[selectedReport.status]?.label || selectedReport.status}
                  </span>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700">Reason</p>
                <p className="text-gray-900">{selectedReport.reason}</p>
              </div>

              {selectedReport.description && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Description</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedReport.description}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-gray-700">Reporter</p>
                <p className="text-gray-900">{selectedReport.reporter.name}</p>
                <p className="text-gray-600 text-sm">{selectedReport.reporter.email}</p>
              </div>

              {selectedReport.property && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Related Property</p>
                  <p className="text-gray-900 font-medium">{selectedReport.property.title}</p>
                  <p className="text-gray-600 text-sm mb-3">by {selectedReport.property.landlord.name}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPropertyDetails(true)}
                      className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      View Property
                    </button>
                    <button
                      onClick={() => setShowContactModal(true)}
                      className="flex-1 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                    >
                      Contact Landlord
                    </button>
                    <button
                      onClick={() => handleDeleteProperty(selectedReport.property!.id)}
                      disabled={actionLoading}
                      className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      Delete Listing
                    </button>
                  </div>
                </div>
              )}

              {selectedReport.reportedUser && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Reported User</p>
                  <p className="text-gray-900">{selectedReport.reportedUser.name}</p>
                  <p className="text-gray-600 text-sm">{selectedReport.reportedUser.email}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Admin Notes</p>
                {editMode ? (
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this report..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24"
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">{adminNotes || 'No notes'}</p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 flex gap-3">
                {editMode ? (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(selectedReport.id, selectedReport.status)}
                      disabled={actionLoading}
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Landlord Modal */}
      {showContactModal && selectedReport?.property && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Contact Landlord</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Property</p>
                <p className="font-semibold text-gray-900">{selectedReport.property.title}</p>
                <p className="text-sm text-gray-600">Landlord: {selectedReport.property.landlord.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Type your message to the landlord..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  disabled={contactLoading}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleContactLandlord}
                  disabled={contactLoading}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                >
                  {contactLoading ? 'Sending...' : 'Send Message'}
                </button>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Details Modal */}
      {showPropertyDetails && selectedReport?.property && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPropertyDetails(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
              <button onClick={() => setShowPropertyDetails(false)} className="text-gray-500 text-2xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Images Gallery */}
              {selectedReport.property.images && selectedReport.property.images.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Images ({selectedReport.property.images.length})</p>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedReport.property.images.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.url}
                          alt={image.caption || 'Property'}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        {image.isMain && (
                          <span className="absolute top-1 right-1 bg-emerald-500 text-white text-xs px-2 py-1 rounded">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-sm font-semibold text-gray-700">Title</p>
                <p className="text-gray-900 text-lg font-medium">{selectedReport.property.title}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700">Location</p>
                <p className="text-gray-900">{selectedReport.property.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Price</p>
                  <p className="text-gray-900">${selectedReport.property.price}/month</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Type</p>
                  <p className="text-gray-900">{selectedReport.property.type}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Bedrooms</p>
                  <p className="text-gray-900">{selectedReport.property.bedrooms}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Bathrooms</p>
                  <p className="text-gray-900">{selectedReport.property.bathrooms}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Area</p>
                  <p className="text-gray-900">{selectedReport.property.area} sqm</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700">Landlord</p>
                <p className="text-gray-900">{selectedReport.property.landlord.name}</p>
              </div>

              <div className="pt-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowPropertyDetails(false);
                    setShowContactModal(true);
                  }}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-medium"
                >
                  Contact Landlord
                </button>
                <button
                  onClick={() => {
                    handleDeleteProperty(selectedReport.property!.id);
                    setShowPropertyDetails(false);
                  }}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                  Delete Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
