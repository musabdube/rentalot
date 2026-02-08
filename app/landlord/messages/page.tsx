'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, MessageSquare, Send, X, User, Eye } from 'lucide-react';
import { VerificationBadge } from '@/app/components/VerificationBadge';
import { Avatar } from '@/app/components/Avatar';
import { FullPageLoader } from '@/app/components/FullPageLoader';

interface Conversation {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  property: { title: string };
  tenant: { id: string; name: string; avatar: string | null; email: string; isVerified?: boolean; verificationStatus?: boolean };
  landlord: { id: string; name: string; avatar: string | null; email: string; verificationStatus?: boolean };
  unreadCount: number;
  lastMessage: {
    content: string;
    createdAt: string;
    sender: { name: string };
  } | null;
  isAdminMessages?: boolean;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  status: string;
  createdAt: string;
  sender: { id: string; name: string; avatar: string | null };
  receiver: { id: string; name: string; avatar: string | null };
}

export default function LandlordMessagesPage() {
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  // Fetch conversations
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) {
      return;
    }

    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/messages');
        const data = await response.json();
        setConversations(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setConversations([]);
        setLoading(false);
      }
    };

    fetchConversations();
  }, [session?.user?.id, status]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?conversationId=${selectedConversation.id}`);
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);

        // Mark all as read
        await fetch(`/api/messages?conversationId=${selectedConversation.id}`, {
          method: 'PATCH',
        });
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  if (status === 'loading') {
    return <FullPageLoader message="Loading…" />;
  }

  if (!session || session.user?.role !== 'LANDLORD') {
    redirect('/auth/signin');
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    setSending(true);
    try {
      // For admin messages, we can't send a reply in the traditional way
      // We would need to implement a separate endpoint for landlord replies to admin
      if (selectedConversation.isAdminMessages) {
        // TODO: Implement admin message reply functionality
        // Admin message reply not yet implemented (log removed)
        return;
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rentalRequestId: selectedConversation.id,
          receiverId: selectedConversation.tenant.id,
          content: messageText,
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages([...messages, newMessage]);
        setMessageText('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleViewProperty = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/properties/get?id=${propertyId}`);
      const data = await response.json();
      setSelectedProperty(data);
      setShowPropertyModal(true);
    } catch (error) {
      console.error('Error fetching property:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/landlord/dashboard"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh]">
          {/* Conversations List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900">Conversations</h2>
              <p className="text-sm text-gray-600">{conversations.length} total</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <FullPageLoader message="Loading conversations..." small />
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-emerald-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        <Avatar src={conv.tenant?.avatar} name={conv.tenant?.name} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-gray-900 truncate">{conv.isAdminMessages ? '📢 Admin Messages' : conv.tenant.name}</div>
                            {!conv.isAdminMessages && <VerificationBadge isVerified={!!(conv.tenant?.verificationStatus ?? conv.tenant?.isVerified)} size="sm" />}
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">{conv.unreadCount}</span>
                          )}
                        </div>
                        {!conv.isAdminMessages && <p className="text-xs text-gray-600 mb-1 truncate">{conv.property.title}</p>}
                        {conv.lastMessage && (
                          <p className="text-sm text-gray-600 truncate"><span className="font-medium">{conv.lastMessage.sender.name}:</span> {conv.lastMessage.content}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      <Avatar src={selectedConversation?.tenant?.avatar} name={selectedConversation?.tenant?.name} />
                    </div>
                      <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{selectedConversation?.isAdminMessages ? '📢 Admin Messages' : selectedConversation?.tenant?.name}</h3>
                        {!selectedConversation?.isAdminMessages && <VerificationBadge isVerified={!!selectedConversation?.tenant?.verificationStatus} size="sm" />}
                      </div>
                      {!selectedConversation?.isAdminMessages && (
                        <button onClick={() => handleViewProperty(selectedConversation?.propertyId || '')} className="text-sm text-gray-600 hover:text-emerald-600 flex items-center gap-1 transition-colors">
                          <Eye className="w-3 h-3" />
                          {selectedConversation?.property?.title}
                        </button>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setSelectedConversation(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.senderId === session.user?.id;
                      const otherAvatar = msg.sender.avatar || 'https://via.placeholder.com/40?text=User';
                      const otherVerified = selectedConversation?.tenant?.id === msg.sender.id ? !!selectedConversation?.tenant?.verificationStatus : false;

                      return (
                        <div key={msg.id} className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}> 
                          {!isOwn && (
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                              <img src={otherAvatar} alt={msg.sender.name} className="w-full h-full object-cover" />
                            </div>
                          )}

                          <div className={`max-w-xs px-4 py-2 rounded-lg ${isOwn ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{msg.sender.name}</p>
                              {!isOwn && <VerificationBadge isVerified={otherVerified} size="sm" />}
                            </div>
                            <p className="break-words">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isOwn ? 'text-emerald-100' : 'text-gray-600'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  {selectedConversation.isAdminMessages ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center text-blue-700 text-sm">
                      📢 Admin Messages - Awaiting admin communication. You cannot reply here yet.
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={sending || !messageText.trim()}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Property Details Modal */}
        {showPropertyModal && selectedProperty && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPropertyModal(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
                <button onClick={() => setShowPropertyModal(false)} className="text-gray-500 text-2xl">✕</button>
              </div>

              <div className="p-6 space-y-4">
                {/* Images */}
                {selectedProperty.images && selectedProperty.images.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Images</p>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedProperty.images.map((image: any, idx: number) => (
                        <img
                          key={idx}
                          src={image.url}
                          alt="Property"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-gray-700">Title</p>
                  <p className="text-gray-900 text-lg font-medium">{selectedProperty.title}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">Location</p>
                  <p className="text-gray-900">{selectedProperty.suburb || selectedProperty.city}, {selectedProperty.city}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Price</p>
                    <p className="text-gray-900">${selectedProperty.rentAmount || selectedProperty.price}/month</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Type</p>
                    <p className="text-gray-900">{selectedProperty.type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Bedrooms</p>
                    <p className="text-gray-900">{selectedProperty.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Bathrooms</p>
                    <p className="text-gray-900">{selectedProperty.bathrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Area</p>
                    <p className="text-gray-900">{selectedProperty.area} sqm</p>
                  </div>
                </div>

                {selectedProperty.description && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Description</p>
                    <p className="text-gray-900">{selectedProperty.description}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowPropertyModal(false)}
                    className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
