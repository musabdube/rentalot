'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Send, Eye } from 'lucide-react';
import { VerificationBadge } from '@/app/components/VerificationBadge';
import { Avatar } from '@/app/components/Avatar';
import { FullPageLoader } from '@/app/components/FullPageLoader';
import toast from 'react-hot-toast';

interface Conversation {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  status: string;
  property: {
    title: string;
  };
  tenant: {
    id: string;
    name: string;
    avatar?: string;
    email: string;
  };
  landlord: {
    id: string;
    name: string;
    avatar?: string;
    isVerified?: boolean;
    verificationStatus?: boolean;
    email: string;
  };
  messages: Array<{
    content: string;
    createdAt: string;
    sender: {
      id: string;
      name: string;
    };
  }>;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
}

export default function TenantMessagesPage() {
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  // Check authentication first, then fetch
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) {
      return;
    }

    fetchConversations();
  }, [session?.user?.id, status]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages');
      if (!response.ok) {
        console.error('Failed to fetch conversations');
        setConversations([]);
        return;
      }

      const data = await response.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (rentalRequestId: string) => {
    try {
      const response = await fetch(`/api/messages?conversationId=${rentalRequestId}`);
      if (!response.ok) {
        console.error('Failed to fetch messages');
        return;
      }

      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    }
  };

  const handleViewProperty = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/properties/get?id=${propertyId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedProperty(data);
        setShowPropertyModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch property:', error);
      toast.error('Failed to load property details');
    }
  };

  const handleSelectConversation = (rentalRequestId: string) => {
    setSelectedConversation(rentalRequestId);
    fetchMessages(rentalRequestId);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim() || !selectedConversation) {
      return;
    }

    setSendingMessage(true);

    try {
      const conversation = conversations.find((c) => c.id === selectedConversation);
      if (!conversation) return;

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rentalRequestId: selectedConversation,
          content: messageText.trim(),
          receiverId: conversation.landlord.id,
        }),
      });

      if (!response.ok) {
        toast.error('Failed to send message');
        return;
      }

      const newMessage = await response.json();
      setMessages([...messages, newMessage]);
      setMessageText('');
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  if (status === 'loading') {
    return <FullPageLoader message="Loading…" />;
  }

  if (!session || session.user?.role !== 'TENANT') {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto min-h-[60vh] md:h-[600px]">
          {/* Conversations List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
              <h2 className="font-bold text-lg">Messages</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <FullPageLoader message="Loading conversations..." small />
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                conversations.map((conv, index) => (
                  <button
                    key={conv.id || index}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full p-4 border-b border-gray-100 text-left hover:bg-gray-50 transition-colors ${
                      selectedConversation === conv.id ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          <Avatar src={conv.landlord?.avatar} name={conv.landlord?.name} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 truncate">{conv.landlord.name}</p>
                            <VerificationBadge isVerified={!!((conv.landlord as any)?.verificationStatus ?? conv.landlord.isVerified)} size="sm" />
                          </div>
                          <p className="text-sm text-gray-600 truncate">{conv.property.title}</p>
                          <p className="text-xs text-gray-500 mt-1 truncate">{conv.messages[0]?.content || 'No messages yet'}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Messages View */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      <Avatar
                        src={conversations.find((c) => c.id === selectedConversation)?.landlord?.avatar}
                        name={conversations.find((c) => c.id === selectedConversation)?.landlord?.name}
                      />
                    </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">
                            {conversations.find((c) => c.id === selectedConversation)?.landlord.name}
                          </p>
                          <VerificationBadge isVerified={!!(((conversations.find((c) => c.id === selectedConversation)?.landlord) as any)?.verificationStatus ?? conversations.find((c) => c.id === selectedConversation)?.landlord?.isVerified)} size="sm" />
                        </div>
                        <button
                          onClick={() => {
                            const propertyId = conversations.find((c) => c.id === selectedConversation)?.propertyId;
                            if (propertyId) handleViewProperty(propertyId);
                          }}
                          className="text-sm text-emerald-100 hover:text-white hover:underline text-left flex items-center gap-1 mt-1"
                        >
                          <Eye className="w-3 h-3" />
                          {conversations.find((c) => c.id === selectedConversation)?.property.title}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="text-emerald-100 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                    {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.senderId === session?.user?.id;
                      const conv = conversations.find((c) => c.id === selectedConversation);
                      const otherAvatar = conv?.landlord?.avatar || 'https://via.placeholder.com/40?text=User';
                      const otherVerified = !!(((conv?.landlord) as any)?.verificationStatus ?? conv?.landlord?.isVerified);

                      return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end`}> 
                          {!isOwn && (
                            <div className="w-9 h-9 rounded-full overflow-hidden mr-3">
                              <Avatar src={otherAvatar} name={conv?.landlord?.name} />
                            </div>
                          )}

                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${isOwn ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'}`}
                          >
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold">{msg.senderName}</p>
                              {!isOwn && <VerificationBadge isVerified={otherVerified} size="sm" />}
                            </div>
                            <p className="break-words">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isOwn ? 'text-emerald-100' : 'text-gray-500'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      disabled={sendingMessage}
                    />
                    <button
                      type="submit"
                      disabled={sendingMessage || !messageText.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Select a conversation to view messages</p>
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
                  <p className="text-gray-900">{selectedProperty.location}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Price</p>
                    <p className="text-gray-900">${selectedProperty.price}/month</p>
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
