'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Edit, Trash2, MessageSquare, Clock, CheckCircle,
  XCircle, AlertCircle, Users,
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  readAt: string | null;
  sender: { id: string; name: string; avatar: string | null };
  receiver: { id: string; name: string; avatar: string | null };
}

interface RoommateListing {
  id: string;
  title: string;
  bio: string;
  budget: number;
  currency: string;
  preferredLocation: string;
  moveInDate: string;
  moveOutDate: string | null;
  smoking: boolean;
  pets: boolean;
  studyFriendly: boolean;
  nightOwl: boolean;
  earlyBird: boolean;
  cleanliness: string | null;
  gender: string | null;
  occupation: string | null;
  status: string;
  adminNote: string | null;
  _count: { messages: number };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'Under Review', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  APPROVED: { label: 'Approved', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
  ACTIVE: { label: 'Active', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'text-red-600 bg-red-50', icon: XCircle },
  INACTIVE: { label: 'Inactive', color: 'text-gray-600 bg-gray-100', icon: AlertCircle },
};

const PRICE_FMT = new Intl.NumberFormat('en-US');

export default function MyRoommateListingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<RoommateListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  useEffect(() => {
    const fetchOwn = async () => {
      const res = await fetch('/api/roommate/listings?own=true');
      if (res.ok) setListings(await res.json());
      setLoading(false);
    };
    if (status === 'authenticated') fetchOwn();
  }, [status]);

  const loadMessages = async (listingId: string) => {
    setSelectedId(listingId);
    setMessagesLoading(true);
    const res = await fetch(`/api/roommate/messages?listingId=${listingId}`);
    if (res.ok) setMessages(await res.json());
    setMessagesLoading(false);
  };

  const deleteListing = async (id: string) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    setDeleting(id);
    const res = await fetch(`/api/roommate/listings/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setListings((prev) => prev.filter((l) => l.id !== id));
      if (selectedId === id) setSelectedId(null);
    }
    setDeleting(null);
  };

  if (status === 'loading' || loading) {
    return <div className="p-8 text-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/tenant/roommate" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Browse
        </Link>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Users className="w-5 h-5 text-emerald-600" />My Roommate Listing</h1>
          <Link
            href="/tenant/roommate/create"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-emerald-700"
          >
            + New Listing
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
            <p className="text-gray-500 mb-4">You haven&apos;t posted a roommate listing yet.</p>
            <Link
              href="/tenant/roommate/create"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-700"
            >
              Post Your First Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {listings.map((l) => {
              const cfg = STATUS_CONFIG[l.status] ?? STATUS_CONFIG.PENDING;
              const StatusIcon = cfg.icon;
              return (
                <div key={l.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{l.title}</h3>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mt-1 ${cfg.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" /> {cfg.label}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/tenant/roommate/edit/${l.id}`}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => deleteListing(l.id)}
                        disabled={deleting === l.id}
                        className="p-2 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{l.bio}</p>

                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                    <span>{l.currency} {PRICE_FMT.format(l.budget)}/mo</span>
                    <span>·</span>
                    <span>{l.preferredLocation}</span>
                    <span>·</span>
                    <span>Move-in: {new Date(l.moveInDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                  </div>

                  {l.adminNote && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 mb-3">
                      <strong>Admin note:</strong> {l.adminNote}
                    </div>
                  )}

                  <button
                    onClick={() => selectedId === l.id ? setSelectedId(null) : loadMessages(l.id)}
                    className="flex items-center gap-2 text-sm text-emerald-700 font-medium hover:underline"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {selectedId === l.id ? 'Hide' : 'View'} Messages ({l._count.messages})
                  </button>

                  {selectedId === l.id && (
                    <div className="mt-3 border-t border-gray-100 pt-3 space-y-3 max-h-64 overflow-y-auto">
                      {messagesLoading ? (
                        <p className="text-sm text-gray-400">Loading messages...</p>
                      ) : messages.length === 0 ? (
                        <p className="text-sm text-gray-400">No messages yet.</p>
                      ) : (
                        messages.map((m) => {
                          const isMe = m.sender.id === session?.user?.id;
                          return (
                            <div key={m.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                                {m.sender.name[0]}
                              </div>
                              <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${isMe ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                <p>{m.content}</p>
                                <p className={`text-xs mt-1 ${isMe ? 'text-emerald-100' : 'text-gray-400'}`}>
                                  {new Date(m.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  {!isMe && !m.readAt && ' · Unread'}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
