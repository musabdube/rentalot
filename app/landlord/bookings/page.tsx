'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Clock, CheckCircle, XCircle, Ban, Star, X } from 'lucide-react';

interface Booking {
  id: string;
  propertyId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  totalNights: number;
  pricePerNight: number;
  totalPrice: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  guestNotes: string | null;
  hostNotes: string | null;
  rejectionNote: string | null;
  property: { id: string; title: string; city: string; suburb: string; images: { url: string }[] };
  guest: { id: string; name: string; email: string; phone: string | null };
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  PENDING:   { label: 'Pending',   bg: 'bg-amber-100',   text: 'text-amber-800',  dot: 'bg-amber-500'  },
  APPROVED:  { label: 'Approved',  bg: 'bg-green-100',   text: 'text-green-800',  dot: 'bg-green-500'  },
  REJECTED:  { label: 'Rejected',  bg: 'bg-red-100',     text: 'text-red-800',    dot: 'bg-red-500'    },
  CANCELLED: { label: 'Cancelled', bg: 'bg-gray-100',    text: 'text-gray-600',   dot: 'bg-gray-400'   },
  COMPLETED: { label: 'Completed', bg: 'bg-blue-100',    text: 'text-blue-800',   dot: 'bg-blue-500'   },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dateRange(checkIn: string, checkOut: string) {
  const dates: Date[] = [];
  const cur = new Date(checkIn);
  const end = new Date(checkOut);
  while (cur < end) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export default function LandlordBookingsPage() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [hostNote, setHostNote] = useState('');
  const [rejectionNote, setRejectionNote] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      const res = await fetch(`/api/bookings?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  if (status === 'loading') return <div className="p-8 text-center">Loading…</div>;
  if (!session || session.user?.role !== 'LANDLORD') redirect('/auth/signin');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  function prevMonth() { setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)); }
  function nextMonth() { setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)); }

  const activeBookings = bookings.filter(b => !['REJECTED', 'CANCELLED'].includes(b.status));

  function getBookingsForDay(day: number) {
    const d = new Date(year, month, day);
    return activeBookings.filter(b => {
      const dates = dateRange(b.checkIn, b.checkOut);
      return dates.some(dt => isSameDay(dt, d));
    });
  }

  async function handleAction(action: string) {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, hostNotes: hostNote || undefined, rejectionNote: rejectionNote || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedBooking(data.booking);
        setBookings(prev => prev.map(b => b.id === data.booking.id ? data.booking : b));
        setHostNote('');
        setRejectionNote('');
      }
    } finally {
      setActionLoading(false);
    }
  }

  const upcomingPending = bookings
    .filter(b => b.status === 'PENDING')
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime());

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarDays className="w-7 h-7 text-emerald-600" /> Short-Stay Bookings
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage booking requests for your short-term listings</p>
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = bookings.filter(b => b.status === key).length;
            return (
              <div key={key} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
                <span className={`w-3 h-3 rounded-full ${cfg.dot} shrink-0`} />
                <div>
                  <p className="text-xs text-gray-500">{cfg.label}</p>
                  <p className="text-xl font-bold text-gray-900">{count}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pending Requests Alert */}
        {upcomingPending.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" /> {upcomingPending.length} Pending Request{upcomingPending.length > 1 ? 's' : ''} — Action Required
            </h2>
            <div className="flex flex-wrap gap-2">
              {upcomingPending.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className="text-xs bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  {b.property.title} · {new Date(b.checkIn).toLocaleDateString()} – {new Date(b.checkOut).toLocaleDateString()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Calendar header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">{monthName}</h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells for first week */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-22.5 border-b border-r border-gray-100 bg-gray-50" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayBookings = getBookingsForDay(day);
              const today = new Date();
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

              return (
                <div
                  key={day}
                  className={`min-h-22.5 border-b border-r border-gray-100 p-1.5 ${isToday ? 'bg-emerald-50' : ''}`}
                >
                  <span className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full mb-1 ${isToday ? 'bg-emerald-600 text-white' : 'text-gray-700'}`}>
                    {day}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {dayBookings.slice(0, 3).map(b => {
                      const cfg = STATUS_CONFIG[b.status];
                      return (
                        <button
                          key={b.id}
                          onClick={() => setSelectedBooking(b)}
                          className={`w-full text-left px-1.5 py-0.5 rounded text-xs font-medium truncate ${cfg.bg} ${cfg.text} hover:opacity-80 transition-opacity`}
                          title={`${b.property.title} (${b.guest.name})`}
                        >
                          {b.property.title}
                        </button>
                      );
                    })}
                    {dayBookings.length > 3 && (
                      <span className="text-xs text-gray-400 px-1">+{dayBookings.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bookings list */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">All Bookings</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading bookings…</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarDays className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">No bookings yet.</p>
              <p className="text-sm text-gray-400 mt-1">Enable short-term stays on your properties to start receiving booking requests.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {bookings.map(b => {
                const cfg = STATUS_CONFIG[b.status];
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBooking(b)}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {b.property.images[0] && (
                      <img src={b.property.images[0].url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{b.property.title}</p>
                      <p className="text-sm text-gray-500 truncate">Guest: {b.guest.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()} · {b.totalNights} night{b.totalNights !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900">${b.totalPrice}</p>
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Booking Details</h2>
              <button
                onClick={() => { setSelectedBooking(null); setHostNote(''); setRejectionNote(''); }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">

              {/* Property */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Property</p>
                <p className="font-semibold text-gray-900">{selectedBooking.property.title}</p>
                <p className="text-sm text-gray-500">{selectedBooking.property.suburb}, {selectedBooking.property.city}</p>
              </div>

              {/* Guest */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Guest</p>
                <p className="font-semibold text-gray-900">{selectedBooking.guest.name}</p>
                <p className="text-sm text-gray-500">{selectedBooking.guest.email}</p>
                {selectedBooking.guest.phone && <p className="text-sm text-gray-500">{selectedBooking.guest.phone}</p>}
              </div>

              {/* Dates */}
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

              {/* Pricing */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">${selectedBooking.pricePerNight} × {selectedBooking.totalNights} night{selectedBooking.totalNights !== 1 ? 's' : ''}</span>
                  <span className="text-gray-900">${selectedBooking.totalPrice}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-emerald-700">${selectedBooking.totalPrice}</span>
                </div>
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Status:</p>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CONFIG[selectedBooking.status].bg} ${STATUS_CONFIG[selectedBooking.status].text}`}>
                  {STATUS_CONFIG[selectedBooking.status].label}
                </span>
              </div>

              {/* Guest notes */}
              {selectedBooking.guestNotes && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Guest Note</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selectedBooking.guestNotes}</p>
                </div>
              )}

              {/* Host notes (existing) */}
              {selectedBooking.hostNotes && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Your Note</p>
                  <p className="text-sm text-gray-700 bg-emerald-50 rounded-lg p-3">{selectedBooking.hostNotes}</p>
                </div>
              )}

              {/* Rejection note (existing) */}
              {selectedBooking.rejectionNote && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-700 bg-red-50 rounded-lg p-3">{selectedBooking.rejectionNote}</p>
                </div>
              )}

              {/* Actions for PENDING bookings */}
              {selectedBooking.status === 'PENDING' && (
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <textarea
                    value={hostNote}
                    onChange={e => setHostNote(e.target.value)}
                    placeholder="Add a note to the guest (optional)"
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
                      disabled={actionLoading || !rejectionNote.trim()}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                  <input
                    value={rejectionNote}
                    onChange={e => setRejectionNote(e.target.value)}
                    placeholder="Rejection reason (required to reject)"
                    className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              )}

              {/* Actions for APPROVED bookings */}
              {selectedBooking.status === 'APPROVED' && (
                <div className="space-y-3 border-t border-gray-100 pt-4 flex flex-col sm:flex-row gap-2">
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
                    <Ban className="w-4 h-4" /> Cancel Booking
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
