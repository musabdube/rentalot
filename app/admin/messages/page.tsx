'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, MessageSquare, Eye, Send } from 'lucide-react';
import { VerificationBadge } from '@/app/components/VerificationBadge';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  status: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    verificationStatus?: boolean;
    isVerified?: boolean;
  };
  receiver: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
  rentalRequest?: {
    id: string;
    property: {
      title: string;
    };
  };
}

interface RentalConversation {
  id: string;
  propertyId: string;
  tenant: {
    id: string;
    name: string;
    email: string;
    verificationStatus?: boolean;
    isVerified?: boolean;
  };
  landlord: {
    id: string;
    name: string;
    email: string;
    isVerified?: boolean;
    verificationStatus?: boolean;
  };
  property: {
    title: string;
  };
  messages: Message[];
  lastMessage: {
    content: string;
    createdAt: string;
  } | null;
  messageCount: number;
}

interface AdminConversation {
  receiverId: string;
  receiver: {
    id: string;
    name: string;
    avatar?: string;
    email: string;
    role: string;
    verificationStatus?: boolean;
  };
  messages: Message[];
  messageCount: number;
  lastMessage: Message | null;
  lastMessageDate: string;
}

export default function AdminMessagesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'rental' | 'admin'>('admin');
  const [rentalConversations, setRentalConversations] = useState<RentalConversation[]>([]);
  const [adminConversations, setAdminConversations] = useState<AdminConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<RentalConversation | AdminConversation | null>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  useEffect(() => {
    if (sessionStatus === 'loading') {
      return;
    }

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/auth/signin');
      return;
    }

    fetchConversations();
  }, [session, sessionStatus, router]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const [rentalRes, adminRes] = await Promise.all([
        fetch('/api/admin/messages'),
        fetch('/api/admin/admin-messages'),
      ]);

      if (rentalRes.ok) {
        const data = await rentalRes.json();
        setRentalConversations(data);
      }

      if (adminRes.ok) {
        const data = await adminRes.json();
        setAdminConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
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
      toast.error('Failed to load property details');
    }
  };

  const filteredRentalConversations = rentalConversations.filter(conv => {
    const searchLower = searchTerm.toLowerCase();
    return (
      conv.tenant.name.toLowerCase().includes(searchLower) ||
      conv.tenant.email.toLowerCase().includes(searchLower) ||
      conv.landlord.name.toLowerCase().includes(searchLower) ||
      conv.landlord.email.toLowerCase().includes(searchLower) ||
      conv.property.title.toLowerCase().includes(searchLower)
    );
  });

  const filteredAdminConversations = adminConversations.filter(conv => {
    const searchLower = searchTerm.toLowerCase();
    return (
      conv.receiver.name.toLowerCase().includes(searchLower) ||
      conv.receiver.email.toLowerCase().includes(searchLower)
    );
  });

  if (sessionStatus === 'loading' || loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><MessageSquare className="w-7 h-7 text-emerald-600" />Messages</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all platform messages</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => { setActiveTab('admin'); setSelectedConversation(null); }}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                activeTab === 'admin'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Send className="w-4 h-4 inline mr-2" />
              Messages I Sent ({adminConversations.length})
            </button>
            <button
              onClick={() => { setActiveTab('rental'); setSelectedConversation(null); }}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                activeTab === 'rental'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Rental Conversations ({rentalConversations.length})
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Total Messages</p>
            <p className="text-3xl font-bold text-gray-900">
              {activeTab === 'admin'
                ? adminConversations.reduce((sum, conv) => sum + conv.messageCount, 0)
                : rentalConversations.reduce((sum, conv) => sum + conv.messageCount, 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Active Conversations</p>
            <p className="text-3xl font-bold text-green-600">
              {activeTab === 'admin' ? adminConversations.length : rentalConversations.length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'admin' ? 'Search by user name or email...' : 'Search by tenant, landlord, or property...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        {activeTab === 'admin' ? (
          // Admin Messages Tab
          filteredAdminConversations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No messages sent yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAdminConversations.map((conversation) => (
                <div
                  key={conversation.receiverId}
                  onClick={() => setSelectedConversation(conversation)}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {conversation.receiver.avatar && (
                          <img
                            src={conversation.receiver.avatar}
                            alt={conversation.receiver.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{conversation.receiver.name}</p>
                            <VerificationBadge isVerified={!!conversation.receiver.verificationStatus} size="sm" />
                          </div>
                          <p className="text-sm text-gray-600">{conversation.receiver.email}</p>
                          <span className="inline-block text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-800 mt-1">
                            {conversation.receiver.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 mb-2">
                        {conversation.messageCount} messages
                      </span>
                      {conversation.lastMessage && (
                        <>
                          <p className="text-xs text-gray-500 mb-2">
                            {new Date(conversation.lastMessageDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 max-w-xs truncate">
                            {conversation.lastMessage.content.replace('[ADMIN MESSAGE]\n\n', '')}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Rental Conversations Tab
          filteredRentalConversations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No conversations found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRentalConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          {conversation.messageCount} messages
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">{conversation.property.title}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Tenant</p>
                          <div className="flex items-center gap-1">
                            <p>{conversation.tenant.name}</p>
                            <VerificationBadge isVerified={!!conversation.tenant.verificationStatus} size="sm" />
                          </div>
                          <p className="text-xs text-gray-500">{conversation.tenant.email}</p>
                        </div>
                        <div>
                          <p className="font-medium">Landlord</p>
                          <div className="flex items-center gap-1">
                            <p>{conversation.landlord.name}</p>
                            <VerificationBadge isVerified={!!(conversation.landlord.isVerified ?? conversation.landlord.verificationStatus)} size="sm" />
                          </div>
                          <p className="text-xs text-gray-500">{conversation.landlord.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {conversation.lastMessage && (
                        <>
                          <p className="text-xs text-gray-500 mb-2">
                            {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 max-w-xs truncate">
                            {conversation.lastMessage.content}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>

      {/* Conversation Detail Modal */}
      {selectedConversation && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedConversation(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                {'propertyId' in selectedConversation ? (
                  <>
                    <button
                      onClick={() => handleViewProperty((selectedConversation as RentalConversation).propertyId)}
                      className="text-2xl font-bold text-gray-900 hover:text-emerald-600 flex items-center gap-2 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                      {(selectedConversation as RentalConversation).property.title}
                    </button>
                    <p className="text-sm text-gray-600 mt-1">
                      {(selectedConversation as RentalConversation).messageCount} messages in this conversation
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        {(selectedConversation as AdminConversation).receiver.name}
                      </p>
                      <VerificationBadge isVerified={!!(selectedConversation as AdminConversation).receiver.verificationStatus} size="md" />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {(selectedConversation as AdminConversation).receiver.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      {(selectedConversation as AdminConversation).messageCount} messages sent
                    </p>
                  </>
                )}
              </div>
              <button onClick={() => setSelectedConversation(null)} className="text-gray-500 text-2xl">✕</button>
            </div>

            <div className="p-6">
              {'propertyId' in selectedConversation && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs font-semibold text-blue-700">TENANT</p>
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-gray-900">{(selectedConversation as RentalConversation).tenant.name}</p>
                      <VerificationBadge isVerified={!!(selectedConversation as RentalConversation).tenant.verificationStatus} size="sm" />
                    </div>
                    <p className="text-sm text-gray-600">{(selectedConversation as RentalConversation).tenant.email}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <p className="text-xs font-semibold text-emerald-700">LANDLORD</p>
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-gray-900">{(selectedConversation as RentalConversation).landlord.name}</p>
                      <VerificationBadge isVerified={!!((selectedConversation as RentalConversation).landlord.isVerified ?? (selectedConversation as RentalConversation).landlord.verificationStatus)} size="sm" />
                    </div>
                    <p className="text-sm text-gray-600">{(selectedConversation as RentalConversation).landlord.email}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {('messages' in selectedConversation) && selectedConversation.messages.map((message) => {
                  // Determine verification status based on message type
                  let isVerified = false;
                  if ('propertyId' in selectedConversation) {
                    // Rental conversation - check if sender is tenant or landlord
                    if (message.sender.id === (selectedConversation as RentalConversation).tenant.id) {
                      isVerified = !!((selectedConversation as RentalConversation).tenant.isVerified ?? (selectedConversation as RentalConversation).tenant.verificationStatus);
                    } else if (message.sender.id === (selectedConversation as RentalConversation).landlord.id) {
                      isVerified = !!((selectedConversation as RentalConversation).landlord.isVerified ?? (selectedConversation as RentalConversation).landlord.verificationStatus);
                    }
                  } else {
                    // Admin conversation
                    isVerified = !!message.sender.verificationStatus || !!message.sender.isVerified;
                  }

                  return (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg ${
                      'propertyId' in selectedConversation
                        ? message.sender.id === (selectedConversation as RentalConversation).tenant.id
                          ? 'bg-blue-50 border-l-4 border-blue-500'
                          : 'bg-emerald-50 border-l-4 border-emerald-500'
                        : message.content.includes('[ADMIN MESSAGE]')
                        ? 'bg-purple-50 border-l-4 border-purple-500'
                        : 'bg-blue-50 border-l-4 border-blue-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-gray-900">{message.sender.name}</p>
                        <VerificationBadge isVerified={isVerified} size="sm" />
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                      {message.content.replace('[ADMIN MESSAGE]\n\n', '')}
                    </p>
                    {message.content.includes('[ADMIN MESSAGE]') && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded">
                        Admin Message
                      </span>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Details Modal */}
      {showPropertyModal && selectedProperty && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4"
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
    </div>
  );
}
