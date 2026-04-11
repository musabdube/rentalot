'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import {
  Users, MapPin, DollarSign, Calendar, PlusCircle,
  Search, Filter, CheckCircle,
} from 'lucide-react';

interface RoommateListing {
  id: string;
  title: string;
  bio: string;
  budget: number;
  currency: string;
  preferredLocation: string;
  moveInDate: string;
  smoking: boolean;
  pets: boolean;
  studyFriendly: boolean;
  nightOwl: boolean;
  earlyBird: boolean;
  cleanliness: string | null;
  gender: string | null;
  occupation: string | null;
  status: string;
  tenant: {
    id: string;
    name: string;
    avatar: string | null;
    verificationStatus: boolean;
  };
  property: { id: string; title: string; city: string } | null;
}

const PRICE_FMT = new Intl.NumberFormat('en-US');

export default function TenantRoommatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<RoommateListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [messagingId, setMessagingId] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  const fetchListings = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (maxBudget) params.set('maxBudget', maxBudget);
    const res = await fetch(`/api/roommate/listings?${params}`);
    if (res.ok) {
      setListings(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = async (listingId: string, receiverId: string) => {
    if (!messageContent.trim()) return;
    setSending(true);
    const res = await fetch('/api/roommate/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, receiverId, content: messageContent }),
    });
    setSending(false);
    if (res.ok) {
      setMessageContent('');
      setMessagingId(null);
      router.push('/tenant/messages');
    } else {
      const d = await res.json();
      alert(d.error ?? 'Failed to send message');
    }
  };

  if (status === 'loading') {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-600" /> Find a Roommate
            </h1>
            <p className="text-sm text-gray-500 mt-1">Browse tenants looking to share a rental property</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/tenant/messages"
              className="inline-flex items-center gap-2 border border-emerald-600 text-emerald-700 px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-50 transition-colors"
            >
              <MessageSquare className="w-4 h-4" /> Messages
            </Link>
            <Link
              href="/tenant/roommate/create"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Post Your Listing
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-full bg-white px-4 py-2.5">
          <MapPin className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-2 border border-gray-200 rounded-full bg-white px-4 py-2.5 w-44">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <input
            type="number"
            placeholder="Max budget"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            className="w-full text-sm bg-transparent outline-none"
          />
        </div>
        <button
          onClick={fetchListings}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-700 transition-colors"
        >
          <Search className="w-4 h-4" /> Search
        </button>
      </div>

      {/* My listing shortcut */}
      <div className="max-w-5xl mx-auto px-4 pb-2">
        <Link
          href="/tenant/roommate/my-listing"
          className="inline-flex items-center gap-2 text-sm text-emerald-700 font-medium hover:underline"
        >
          <Filter className="w-4 h-4" /> View / edit my listing
        </Link>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading listings...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            No roommate listings found. Be the first to post one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
            {listings.map((l) => (
              <div key={l.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start gap-3 mb-3">
                  {l.tenant.avatar ? (
                    <img src={l.tenant.avatar} alt={l.tenant.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                      {l.tenant.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-900 truncate">{l.tenant.name}</span>
                      {l.tenant.verificationStatus && (
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{l.occupation ?? 'Tenant'}</p>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium">
                    {l.currency} {PRICE_FMT.format(l.budget)}/mo
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{l.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{l.bio}</p>

                <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                    <MapPin className="w-3 h-3" /> {l.preferredLocation}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                    <Calendar className="w-3 h-3" /> {new Date(l.moveInDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric', day: 'numeric' })}
                  </span>
                  {l.gender && (
                    <span className="bg-gray-50 px-2 py-1 rounded-full capitalize">{l.gender}</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {l.pets && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Pets OK</span>}
                  {l.smoking && <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">Smoker</span>}
                  {l.studyFriendly && <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">Study-friendly</span>}
                  {l.nightOwl && <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">Night owl</span>}
                  {l.earlyBird && <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">Early bird</span>}
                </div>

                {session?.user?.id !== l.tenant.id && (
                  <>
                    {messagingId === l.id ? (
                      <div className="border-t border-gray-100 pt-3">
                        <textarea
                          rows={3}
                          className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
                          placeholder="Write a message..."
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => sendMessage(l.id, l.tenant.id)}
                            disabled={sending}
                            className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {sending ? 'Sending...' : 'Send & View in Messages'}
                          </button>
                          <button
                            onClick={() => setMessagingId(null)}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setMessagingId(l.id); setMessageContent(''); }}
                        className="w-full flex items-center justify-center gap-2 border border-emerald-200 text-emerald-700 py-2 rounded-full text-sm font-semibold hover:bg-emerald-50 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" /> Message
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
