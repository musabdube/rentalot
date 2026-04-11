'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Users, CheckCircle, XCircle, Clock, MessageSquare, AlertCircle,
  ChevronLeft, ChevronRight, RefreshCw,
} from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  bio: string;
  budget: number;
  currency: string;
  preferredLocation: string;
  moveInDate: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  tenant: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    verificationStatus: boolean;
  };
  _count: { messages: number };
  property: { id: string; title: string; city: string } | null;
}

const PRICE_FMT = new Intl.NumberFormat('en-US');

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Inactive', value: 'INACTIVE' },
];

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  APPROVED: 'bg-emerald-50 text-emerald-700',
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-50 text-red-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
};

export default function AdminRoommatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [page, setPage] = useState(1);
  const [actionState, setActionState] = useState<Record<string, boolean>>({});
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') router.push('/');
  }, [status, session, router]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (activeTab) params.set('status', activeTab);
    const res = await fetch(`/api/admin/roommate?${params}`);
    if (res.ok) {
      const data = await res.json();
      setListings(data.listings);
      setTotal(data.total);
      setPendingCount(data.pendingCount);
      setMessageCount(data.messageCount);
    }
    setLoading(false);
  }, [page, activeTab]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const act = async (id: string, newStatus: string) => {
    setActionState((p) => ({ ...p, [id]: true }));
    await fetch('/api/admin/roommate', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus, adminNote: noteMap[id] ?? null }),
    });
    setActionState((p) => ({ ...p, [id]: false }));
    fetchListings();
  };

  const totalPages = Math.ceil(total / 20);

  if (status === 'loading') return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-600" /> Roommate Listings Monitor
            </h1>
            <p className="text-sm text-gray-500 mt-1">Review, approve, and manage all roommate listings</p>
          </div>
          <button onClick={fetchListings} className="inline-flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Listings', value: total, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Pending Review', value: pendingCount, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Messages Sent', value: messageCount, icon: MessageSquare, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'On Page', value: listings.length, icon: AlertCircle, color: 'text-gray-600 bg-gray-100' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => { setActiveTab(t.value); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${activeTab === t.value ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400'}`}
            >
              {t.label}
              {t.value === 'PENDING' && pendingCount > 0 && (
                <span className="ml-1.5 bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading listings...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No listings found for this filter.</div>
        ) : (
          <div className="space-y-4">
            {listings.map((l) => (
              <div key={l.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {l.tenant.avatar ? (
                      <img src={l.tenant.avatar} alt={l.tenant.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                        {l.tenant.name[0]}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{l.tenant.name}</span>
                        {l.tenant.verificationStatus && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[l.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {l.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{l.tenant.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400">{new Date(l.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MessageSquare className="w-3.5 h-3.5" /> {l._count.messages}
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="font-semibold text-gray-900">{l.title}</h3>
                  <p
                    className={`text-sm text-gray-600 mt-1 ${expandedId === l.id ? '' : 'line-clamp-2'}`}
                    onClick={() => setExpandedId(expandedId === l.id ? null : l.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {l.bio}
                  </p>
                  {l.bio.length > 120 && (
                    <button className="text-xs text-emerald-600 mt-1 hover:underline" onClick={() => setExpandedId(expandedId === l.id ? null : l.id)}>
                      {expandedId === l.id ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3 text-xs text-gray-500">
                  <span>{l.currency} {PRICE_FMT.format(l.budget)}/mo</span>
                  <span>·</span>
                  <span>{l.preferredLocation}</span>
                  <span>·</span>
                  <span>Move-in: {new Date(l.moveInDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                  {l.property && <span className="text-emerald-600">· Linked: {l.property.title}</span>}
                </div>

                {l.adminNote && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
                    <strong>Note:</strong> {l.adminNote}
                  </div>
                )}

                {/* Admin actions */}
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <textarea
                    rows={2}
                    placeholder="Optional admin note..."
                    value={noteMap[l.id] ?? ''}
                    onChange={(e) => setNoteMap((p) => ({ ...p, [l.id]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-300 resize-none mb-3"
                  />
                  <div className="flex flex-wrap gap-2">
                    {l.status !== 'APPROVED' && l.status !== 'ACTIVE' && (
                      <button
                        onClick={() => act(l.id, 'APPROVED')}
                        disabled={actionState[l.id]}
                        className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    {l.status === 'APPROVED' && (
                      <button
                        onClick={() => act(l.id, 'ACTIVE')}
                        disabled={actionState[l.id]}
                        className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-blue-700 disabled:opacity-60"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Set Active
                      </button>
                    )}
                    {l.status !== 'REJECTED' && (
                      <button
                        onClick={() => act(l.id, 'REJECTED')}
                        disabled={actionState[l.id]}
                        className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-red-700 disabled:opacity-60"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}
                    {l.status !== 'INACTIVE' && (
                      <button
                        onClick={() => act(l.id, 'INACTIVE')}
                        disabled={actionState[l.id]}
                        className="flex items-center gap-1.5 border border-gray-300 text-gray-600 px-4 py-2 rounded-full text-xs font-semibold hover:bg-gray-50 disabled:opacity-60"
                      >
                        <AlertCircle className="w-3.5 h-3.5" /> Deactivate
                      </button>
                    )}
                    {l.status !== 'PENDING' && (
                      <button
                        onClick={() => act(l.id, 'PENDING')}
                        disabled={actionState[l.id]}
                        className="flex items-center gap-1.5 border border-yellow-300 text-yellow-700 px-4 py-2 rounded-full text-xs font-semibold hover:bg-yellow-50 disabled:opacity-60"
                      >
                        <Clock className="w-3.5 h-3.5" /> Reset to Pending
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
