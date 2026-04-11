'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { CalendarDays, X, ChevronLeft, ChevronRight, CheckCircle, XCircle, Ban, Star } from 'lucide-react';

interface Booking {
  id: string;
  propertyId: string;
  guestId: string;
  hostId: string;
  checkIn: string;
  checkOut: string;
  totalNights: number;
  pricePerNight: number;
  totalPrice: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  guestNotes: string | null;
  hostNotes: string | null;
  rejectionNote: string | null;
  createdAt: string;
  property: { id: string; title: string; city: string; suburb: string; images: { url: string }[] };
  guest: { id: string; name: string; email: string; phone: string | null };
  host: { id: string; name: string; email: string; phone: string | null };
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  PENDING:   { label: 'Pending',   bg: 'bg-amber-100',   text: 'text-amber-800',  dot: 'bg-amber-400'  },
  APPROVED:  { label: 'Approved',  bg: 'bg-green-100',   text: 'text-green-800',  dot: 'bg-green-500'  },
  REJECTED:  { label: 'Rejected',  bg: 'bg-red-100',     text: 'text-red-800',    dot: 'bg-red-500'    },
  CANCELLED: { label: 'Cancelled', bg: 'bg-gray-100',    text: 'text-gray-600',   dot: 'bg-gray-400'   },
  COMPLETED: { label: 'Completed', bg: 'bg-blue-100',    text: 'text-blue-800',   dot: 'bg-blue-500'   },
};

export default function AdminBookingsPage() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [noteInput, setNoteInput] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (filterStatus) params.set('status', filterStatus);
      if (filterFrom) params.set('from', filterFrom);
      if (filterTo) params.set('to', filterTo);
      const res = await fetch(`/api/admin/bookings?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings);
        setTotal(data.total);
        setPages(data.pages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterFrom, filterTo]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  if (status === 'loading') return <div className="p-8 text-center">Loading…</div>;
  if (!session || session.user?.role !== 'ADMIN') redirect('/auth/signin');

  async function handleAction(action: string) {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      const body: Record<string, string> = { action };
      if (action === 'REJECTED' && noteInput) body.rejectionNote = noteInput;
      if (action === 'APPROVED' && noteInput) body.hostNotes = noteInput;
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedBooking(data.booking);
        setBookings(prev => prev.map(b => b.id === data.booking.id ? data.booking : b));
        setNoteInput('');
      }
    } finally {
      setActionLoading(false);
    }
  }

  const statCounts = Object.keys(STATUS_CONFIG).reduce<Record<string, number>>((acc, key) => {
    acc[key] = bookings.filter(b => b.status === key).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-emerald-600" /> Short-Stay Bookings
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage all short-term booking requests across the platform</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
              <span className={`w-3 h-3 rounded-full ${cfg.dot} shrink-0`} />
              <div>
                <p className="text-xs text-gray-500">{cfg.label}</p>
                <p className="text-xl font-bold text-gray-900">{statCounts[key] ?? 0}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-35"
            >
              <option value="">All statuses</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Check-in from</label>
            <input
              type="date"
              value={filterFrom}
              onChange={e => { setFilterFrom(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Check-in to</label>
            <input
              type="date"
              value={filterTo}
              onChange={e => { setFilterTo(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {(filterStatus || filterFrom || filterTo) && (
            <button
              onClick={() => { setFilterStatus(''); setFilterFrom(''); setFilterTo(''); setPage(1); }}
              className="text-sm text-red-600 underline hover:no-underline"
            >
              Clear filters
            </button>
          )}
          <span className="ml-auto text-sm text-gray-500">{total} booking{total !== 1 ? 's' : ''}</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading…</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarDays className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">No bookings found.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Property</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Guest</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Host</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Dates</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nights</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Submitted</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map(b => {
                      const cfg = STATUS_CONFIG[b.status];
                      return (
                        <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {b.property.images[0] && (
                                <img src={b.property.images[0].url} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                              )}
                              <span className="font-medium text-gray-900 truncate max-w-40">{b.property.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{b.guest.name}</td>
                          <td className="px-4 py-3 text-gray-700">{b.host.name}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {new Date(b.checkIn).toLocaleDateString()} – {new Date(b.checkOut).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{b.totalNights}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900">${b.totalPrice}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => { setSelectedBooking(b); setNoteInput(''); }}
                              className="text-xs text-emerald-600 hover:text-emerald-800 font-medium underline"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-3 px-6 py-4 border-t border-gray-100">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">Page {page} of {pages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Booking Details</h2>
              <button onClick={() => setSelectedBooking(null)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Property</p>
                <p className="font-semibold text-gray-900">{selectedBooking.property.title}</p>
                <p className="text-sm text-gray-500">{selectedBooking.property.suburb}, {selectedBooking.property.city}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Guest</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.guest.name}</p>
                  <p className="text-xs text-gray-500">{selectedBooking.guest.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Host</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.host.name}</p>
                  <p className="text-xs text-gray-500">{selectedBooking.host.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Check-in</p>
                  <p className="font-semibold text-gray-900">{new Date(selectedBooking.checkIn).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Check-out</p>
                  <p className="font-semibold text-gray-900">{new Date(selectedBooking.checkOut).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">${selectedBooking.pricePerNight}/night × {selectedBooking.totalNights} nights</span>
                  <span>${selectedBooking.totalPrice}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 mt-2">
                  <span>Total</span>
                  <span className="text-emerald-700">${selectedBooking.totalPrice}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Status:</p>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CONFIG[selectedBooking.status].bg} ${STATUS_CONFIG[selectedBooking.status].text}`}>
                  {STATUS_CONFIG[selectedBooking.status].label}
                </span>
              </div>

              {selectedBooking.guestNotes && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Guest Note</p>
                  <p className="text-sm bg-gray-50 rounded-lg p-3 text-gray-700">{selectedBooking.guestNotes}</p>
                </div>
              )}
              {selectedBooking.hostNotes && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Host Note</p>
                  <p className="text-sm bg-emerald-50 rounded-lg p-3 text-gray-700">{selectedBooking.hostNotes}</p>
                </div>
              )}
              {selectedBooking.rejectionNote && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rejection Reason</p>
                  <p className="text-sm bg-red-50 rounded-lg p-3 text-red-700">{selectedBooking.rejectionNote}</p>
                </div>
              )}

              {/* Admin actions */}
              {selectedBooking.status === 'PENDING' && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Admin Override</p>
                  <textarea
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    placeholder="Note (optional for approve; required for reject)"
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction('APPROVED')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleAction('REJECTED')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              )}

              {selectedBooking.status === 'APPROVED' && (
                <div className="border-t border-gray-100 pt-4 flex gap-2">
                  <button
                    onClick={() => handleAction('COMPLETED')}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Star className="w-4 h-4" /> Mark Completed
                  </button>
                  <button
                    onClick={() => handleAction('CANCELLED')}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    <Ban className="w-4 h-4" /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
