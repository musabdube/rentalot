'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Mail, Eye, Archive, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Enquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'ARCHIVED';
  createdAt: string;
  readAt?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

type StatusFilter = 'all' | 'NEW' | 'READ' | 'ARCHIVED';

const statusStyles: Record<Enquiry['status'], string> = {
  NEW: 'bg-emerald-100 text-emerald-800',
  READ: 'bg-blue-100 text-blue-800',
  ARCHIVED: 'bg-gray-100 text-gray-800',
};

export default function AdminEnquiriesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/auth/signin');
      return;
    }

    fetchEnquiries();
  }, [session, sessionStatus, router]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/enquiries');
      if (response.ok) {
        const data = await response.json();
        setEnquiries(data);
      } else {
        toast.error('Failed to load enquiries');
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: Enquiry['status']) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/enquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (response.ok) {
        await fetchEnquiries();
        toast.success('Enquiry updated');
        if (selectedEnquiry?.id === id) {
          const updated = await response.json();
          setSelectedEnquiry(updated);
        }
      } else {
        toast.error('Failed to update enquiry');
      }
    } catch (error) {
      console.error('Error updating enquiry:', error);
      toast.error('Failed to update enquiry');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredEnquiries = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return enquiries.filter((enquiry) => {
      const matchesSearch =
        enquiry.name.toLowerCase().includes(search) ||
        enquiry.email.toLowerCase().includes(search) ||
        enquiry.subject.toLowerCase().includes(search) ||
        enquiry.message.toLowerCase().includes(search);

      const matchesStatus = statusFilter === 'all' || enquiry.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enquiries, searchTerm, statusFilter]);

  if (sessionStatus === 'loading' || loading) {
    return <div className="p-8">Loading...</div>;
  }

  const newCount = enquiries.filter((e) => e.status === 'NEW').length;

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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><Mail className="w-7 h-7 text-emerald-600" />Enquiries</h1>
          <p className="text-gray-600 mt-1">Contact form submissions from users</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Total Enquiries</p>
            <p className="text-3xl font-bold text-gray-900">{enquiries.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">New</p>
            <p className="text-3xl font-bold text-emerald-600">{newCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, subject, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All statuses</option>
              <option value="NEW">New</option>
              <option value="READ">Read</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {filteredEnquiries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No enquiries found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEnquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-gray-900">{enquiry.name}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[enquiry.status]}`}>
                        {enquiry.status}
                      </span>
                      {enquiry.user?.id && (
                        <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-indigo-100 text-indigo-800">
                          Registered User
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{enquiry.email}</p>
                    <p className="text-sm text-gray-500 mt-2 font-medium">{enquiry.subject}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{enquiry.message}</p>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <p className="text-xs text-gray-500">
                      {new Date(enquiry.createdAt).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedEnquiry(enquiry)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      {enquiry.status !== 'READ' && (
                        <button
                          onClick={() => handleStatusUpdate(enquiry.id, 'READ')}
                          disabled={actionLoading}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Read
                        </button>
                      )}
                      {enquiry.status !== 'ARCHIVED' && (
                        <button
                          onClick={() => handleStatusUpdate(enquiry.id, 'ARCHIVED')}
                          disabled={actionLoading}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-60"
                        >
                          <Archive className="w-4 h-4" />
                          Archive
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedEnquiry && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEnquiry(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{selectedEnquiry.subject}</h2>
              <p className="text-sm text-gray-600 mt-1">
                From {selectedEnquiry.name} ({selectedEnquiry.email})
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-500">Received</p>
                <p className="text-sm text-gray-800">
                  {new Date(selectedEnquiry.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Message</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedEnquiry.message}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              {selectedEnquiry.status !== 'READ' && (
                <button
                  onClick={() => handleStatusUpdate(selectedEnquiry.id, 'READ')}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Read
                </button>
              )}
              {selectedEnquiry.status !== 'ARCHIVED' && (
                <button
                  onClick={() => handleStatusUpdate(selectedEnquiry.id, 'ARCHIVED')}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-60"
                >
                  <Archive className="w-4 h-4" />
                  Archive
                </button>
              )}
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
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
