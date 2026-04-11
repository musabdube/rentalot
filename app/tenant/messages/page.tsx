'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, MessageSquare, Send, X, Eye, Users, Home } from 'lucide-react';
import { VerificationBadge } from '@/app/components/VerificationBadge';
import { Avatar } from '@/app/components/Avatar';
import { FullPageLoader } from '@/app/components/FullPageLoader';

// Types

interface PropertyConversation {
  kind: 'property';
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  property: { title: string };
  tenant: { id: string; name: string; avatar: string | null; email: string };
  landlord: { id: string; name: string; avatar: string | null; email: string; isVerified?: boolean; verificationStatus?: boolean };
  unreadCount: number;
  lastMessage: { content: string; createdAt: string; sender: { name: string } } | null;
  isAdminMessages?: boolean;
}

interface RoommateConversation {
  kind: 'roommate';
  listingId: string;
  listing: { id: string; title: string; tenant: { id: string; name: string; avatar: string | null } };
  otherUser: { id: string; name: string; avatar: string | null };
  lastMessage: { content: string; createdAt: string; senderId: string };
  unreadCount: number;
}

type AnyConversation = PropertyConversation | RoommateConversation;

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  status?: string;
  readAt?: string | null;
  createdAt: string;
  sender: { id: string; name: string; avatar: string | null };
  receiver: { id: string; name: string; avatar: string | null };
}

// Helpers

function convKey(c: AnyConversation) {
  return c.kind === 'property' ? `p-${c.id}` : `r-${c.listingId}`;
}

function convOtherUser(c: AnyConversation) {
  if (c.kind === 'property') return c.isAdminMessages ? { id: '', name: 'Admin', avatar: null } : c.landlord;
  return c.otherUser;
}

function convLabel(c: AnyConversation) {
  if (c.kind === 'property') return c.isAdminMessages ? 'Admin' : c.property.title;
  return c.listing.title;
}

function convLastMsg(c: AnyConversation) {
  if (!c.lastMessage) return '';
  return c.lastMessage.content;
}

function convLastTime(c: AnyConversation): Date {
  if (!c.lastMessage) return new Date(0);
  return new Date(c.lastMessage.createdAt);
}

// Component

export default function TenantMessagesPage() {
  const { data: session, status } = useSession();

  const [propertyConvs, setPropertyConvs] = useState<PropertyConversation[]>([]);
  const [roommateConvs, setRoommateConvs] = useState<RoommateConversation[]>([]);
  const [selected, setSelected] = useState<AnyConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'property' | 'roommate'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return;

    const load = async () => {
      setLoading(true);
      try {
        const [propRes, roomRes] = await Promise.all([
          fetch('/api/messages'),
          fetch('/api/roommate/messages?inbox=true'),
        ]);
        const propData = propRes.ok ? await propRes.json() : [];
        const roomData = roomRes.ok ? await roomRes.json() : [];
        setPropertyConvs(Array.isArray(propData) ? propData.map((c: any) => ({ ...c, kind: 'property' as const })) : []);
        setRoommateConvs(Array.isArray(roomData) ? roomData.map((c: any) => ({ ...c, kind: 'roommate' as const })) : []);
      } catch (err) {
        console.error('Error loading conversations', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [session?.user?.id, status]);

  useEffect(() => {
    if (!selected) return;
    const load = async () => {
      try {
        let data: Message[] = [];
        if (selected.kind === 'property') {
          const res = await fetch(`/api/messages?conversationId=${selected.id}`);
          data = res.ok ? await res.json() : [];
          await fetch(`/api/messages?conversationId=${selected.id}`, { method: 'PATCH' });
        } else {
          const res = await fetch(`/api/roommate/messages?listingId=${selected.listingId}`);
          data = res.ok ? await res.json() : [];
          setRoommateConvs(prev =>
            prev.map(c => c.listingId === selected.listingId ? { ...c, unreadCount: 0 } : c)
          );
        }
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading messages', err);
        setMessages([]);
      }
    };
    load();
  }, [selected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (status === 'loading') return <FullPageLoader message="Loading..." />;
  if (!session || session.user?.role !== 'TENANT') redirect('/auth/signin');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selected) return;
    setSending(true);
    try {
      let res: Response;
      if (selected.kind === 'property') {
        res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rentalRequestId: selected.id,
            receiverId: selected.landlord.id,
            content: messageText,
          }),
        });
      } else {
        res = await fetch('/api/roommate/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listingId: selected.listingId,
            receiverId: selected.otherUser.id,
            content: messageText.trim(),
          }),
        });
      }
      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
        setMessageText('');
      }
    } catch (err) {
      console.error('Error sending message', err);
    } finally {
      setSending(false);
    }
  };

  const handleViewProperty = async (propertyId: string) => {
    try {
      const res = await fetch(`/api/properties/get?id=${propertyId}`);
      setSelectedProperty(await res.json());
      setShowPropertyModal(true);
    } catch (err) {
      console.error('Error fetching property', err);
    }
  };

  const allConvs: AnyConversation[] = [
    ...(filter !== 'roommate' ? propertyConvs : []),
    ...(filter !== 'property' ? roommateConvs : []),
  ].sort((a, b) => convLastTime(b).getTime() - convLastTime(a).getTime());

  const totalUnread = allConvs.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/tenant/dashboard" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-7 h-7 text-emerald-600" /> Messages
              {totalUnread > 0 && (
                <span className="bg-red-500 text-white text-sm font-bold rounded-full px-2 py-0.5">{totalUnread}</span>
              )}
            </h1>
            <div className="flex gap-2">
              {(['all', 'property', 'roommate'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setSelected(null); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {f === 'property' && <Home className="w-3.5 h-3.5" />}
                  {f === 'roommate' && <Users className="w-3.5 h-3.5" />}
                  {f === 'all' ? 'All' : f === 'property' ? 'Properties' : 'Roommates'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh]">
          {/* Conversation list */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900">Conversations</h2>
              <p className="text-sm text-gray-600">{allConvs.length} total</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-400">Loading...</div>
              ) : allConvs.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                allConvs.map((conv) => {
                  const other = convOtherUser(conv);
                  const label = convLabel(conv);
                  const unread = conv.unreadCount;
                  const last = convLastMsg(conv);
                  const key = convKey(conv);
                  const isSelected = selected ? convKey(selected) === key : false;
                  const isRoommate = conv.kind === 'roommate';

                  return (
                    <button
                      key={key}
                      onClick={() => setSelected(conv)}
                      className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-emerald-50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0 relative">
                          <Avatar src={other.avatar} name={other.name} />
                          <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] ${isRoommate ? 'bg-teal-500' : 'bg-blue-500'}`}>
                            {isRoommate ? <Users className="w-2.5 h-2.5" /> : <Home className="w-2.5 h-2.5" />}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-medium text-gray-900 truncate text-sm">{other.name}</span>
                            {unread > 0 && (
                              <span className="bg-emerald-600 text-white text-xs px-1.5 py-0.5 rounded-full shrink-0">{unread}</span>
                            )}
                          </div>
                          <p className="text-xs text-emerald-700 truncate">{label}</p>
                          {last && <p className="text-xs text-gray-500 truncate">{last}</p>}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
            {selected ? (
              <>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
                      <Avatar src={convOtherUser(selected).avatar} name={convOtherUser(selected).name} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{convOtherUser(selected).name}</h3>
                        {selected.kind === 'property' && !selected.isAdminMessages && (
                          <VerificationBadge isVerified={!!(selected.landlord.verificationStatus ?? selected.landlord.isVerified)} size="sm" />
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selected.kind === 'roommate' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'}`}>
                          {selected.kind === 'roommate' ? 'Roommate' : 'Property'}
                        </span>
                      </div>
                      {selected.kind === 'property' && !selected.isAdminMessages ? (
                        <button onClick={() => handleViewProperty(selected.propertyId)} className="text-xs text-gray-500 hover:text-emerald-600 flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {selected.property.title}
                        </button>
                      ) : (
                        <p className="text-xs text-gray-500">{convLabel(selected)}</p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.senderId === session.user?.id;
                      return (
                        <div key={msg.id} className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          {!isOwn && (
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-gray-100">
                              <Avatar src={msg.sender.avatar} name={msg.sender.name} />
                            </div>
                          )}
                          <div className={`max-w-xs px-4 py-2 rounded-2xl ${isOwn ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-900 rounded-tl-sm'}`}>
                            <p className="text-sm wrap-break-word">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isOwn ? 'text-emerald-200' : 'text-gray-500'}`}>
                              {new Date(msg.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      disabled={sending}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e as any); } }}
                    />
                    <button
                      type="submit"
                      disabled={sending || !messageText.trim()}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Conversation</h3>
                  <p className="text-gray-600">All your property and roommate messages are here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Property Modal */}
        {showPropertyModal && selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowPropertyModal(false)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
                <button onClick={() => setShowPropertyModal(false)} className="text-gray-500 text-2xl">x</button>
              </div>
              <div className="p-6 space-y-4">
                {selectedProperty.images?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Images</p>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedProperty.images.map((image: any, idx: number) => (
                        <img key={idx} src={image.url} alt="Property" className="w-full h-24 object-cover rounded-lg" />
                      ))}
                    </div>
                  </div>
                )}
                <div><p className="text-sm font-semibold text-gray-700">Title</p><p className="text-gray-900 text-lg font-medium">{selectedProperty.title}</p></div>
                <div><p className="text-sm font-semibold text-gray-700">Location</p><p className="text-gray-900">{selectedProperty.location || selectedProperty.city}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm font-semibold text-gray-700">Price</p><p className="text-gray-900">${selectedProperty.rentAmount || selectedProperty.price}/month</p></div>
                  <div><p className="text-sm font-semibold text-gray-700">Type</p><p className="text-gray-900">{selectedProperty.type}</p></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><p className="text-sm font-semibold text-gray-700">Bedrooms</p><p className="text-gray-900">{selectedProperty.bedrooms}</p></div>
                  <div><p className="text-sm font-semibold text-gray-700">Bathrooms</p><p className="text-gray-900">{selectedProperty.bathrooms}</p></div>
                  <div><p className="text-sm font-semibold text-gray-700">Area</p><p className="text-gray-900">{selectedProperty.area} sqm</p></div>
                </div>
                {selectedProperty.description && (
                  <div><p className="text-sm font-semibold text-gray-700">Description</p><p className="text-gray-900">{selectedProperty.description}</p></div>
                )}
                <div className="pt-4 border-t border-gray-200">
                  <button onClick={() => setShowPropertyModal(false)} className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 font-medium">Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
