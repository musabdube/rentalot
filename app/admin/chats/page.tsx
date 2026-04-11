'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MessageCircle, Send, RefreshCw, Clock, User, CheckCheck, X } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderName: string;
  senderRole: string;
  isAdminMessage: boolean;
  createdAt: string;
  read: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface Chat {
  id: string;
  userId?: string;
  user?: User;
  guestName?: string;
  guestEmail?: string;
  status: 'OPEN' | 'CLOSED';
  subject?: string;
  messages: Message[];
  lastMessageAt: string;
  createdAt: string;
  _count: {
    messages: number;
  };
}

export default function AdminLiveChatsPage() {
  const { data: session, status } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<'all' | 'OPEN' | 'CLOSED'>('OPEN');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch all chats
  const fetchChats = async () => {
    try {
      const statusParam = filter === 'all' ? '' : `?status=${filter}`;
      const res = await fetch(`/api/admin/live-chat${statusParam}`);
      if (res.ok) {
        const data = await res.json();
        setChats(data);
        
        // Update selected chat if it exists in the new data
        if (selectedChat) {
          const updatedChat = data.find((c: Chat) => c.id === selectedChat.id);
          if (updatedChat) {
            setSelectedChat(updatedChat);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific chat with messages
  const fetchChatDetails = async (chatId: string) => {
    try {
      const res = await fetch(`/api/live-chat?chatId=${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedChat(data);
        
        // Mark messages as read
        await fetch('/api/live-chat', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId, action: 'markRead' }),
        });
        
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error fetching chat details:', error);
    }
  };

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: selectedChat.id, content: message }),
      });

      if (res.ok) {
        setMessage('');
        await fetchChatDetails(selectedChat.id);
        await fetchChats(); // Refresh chat list
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Close chat
  const closeChat = async (chatId: string) => {
    if (!confirm('Are you sure you want to close this chat?')) return;

    try {
      const res = await fetch('/api/live-chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, action: 'close' }),
      });

      if (res.ok) {
        await fetchChats();
        if (selectedChat?.id === chatId) {
          setSelectedChat(null);
        }
      }
    } catch (error) {
      console.error('Error closing chat:', error);
    }
  };

  // Poll for updates
  useEffect(() => {
    if (selectedChat) {
      pollingInterval.current = setInterval(() => {
        fetchChatDetails(selectedChat.id);
      }, 3000);
    } else if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [selectedChat?.id]);

  // Fetch chats on mount and filter change
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      redirect('/auth/signin');
    }
    fetchChats();
  }, [status, session, filter]);

  // Auto-refresh chat list
  useEffect(() => {
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, [filter]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalUnread = chats.reduce((acc, chat) => acc + chat._count.messages, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><MessageCircle className="w-7 h-7 text-emerald-600" />Live Support Chats</h1>
              <p className="text-gray-600 mt-1">Manage customer support conversations</p>
            </div>
            <button
              onClick={fetchChats}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Chats</p>
                <p className="text-2xl font-bold text-gray-900">{chats.length}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Chats</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {chats.filter((c) => c.status === 'OPEN').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-red-600">{totalUnread}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'OPEN', 'CLOSED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                filter === f
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat List */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-900">Conversations ({chats.length})</h2>
            </div>
            <div className="overflow-y-auto max-h-[600px]">
              {chats.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No chats yet</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => fetchChatDetails(chat.id)}
                    className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                      selectedChat?.id === chat.id ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <p className="font-medium text-gray-900 truncate">
                            {chat.user?.name || chat.guestName || 'Guest'}
                          </p>
                          {chat._count.messages > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {chat._count.messages}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                          {chat.user?.role || 'Guest'} • {chat.user?.email || chat.guestEmail}
                        </p>
                        {chat.messages[0] && (
                          <p className="text-sm text-gray-600 truncate">
                            {chat.messages[0].content}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            chat.status === 'OPEN'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {chat.status}
                        </span>
                        <p className="text-xs text-gray-400">
                          {new Date(chat.lastMessageAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
            {!selectedChat ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Select a chat to view conversation</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedChat.user?.name || selectedChat.guestName || 'Guest'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedChat.user?.role || 'Guest'} • {selectedChat.user?.email || selectedChat.guestEmail}
                    </p>
                  </div>
                  {selectedChat.status === 'OPEN' && (
                    <button
                      onClick={() => closeChat(selectedChat.id)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Close Chat
                    </button>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {selectedChat.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isAdminMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-4 py-2 ${
                          msg.isAdminMessage
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                      >
                        {!msg.isAdminMessage && (
                          <p className="text-xs font-semibold text-gray-600 mb-1">
                            {msg.senderName}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p
                            className={`text-xs ${
                              msg.isAdminMessage ? 'text-emerald-100' : 'text-gray-400'
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {msg.isAdminMessage && msg.read && (
                            <CheckCheck className="w-3 h-3 text-emerald-100" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      disabled={sending || selectedChat.status === 'CLOSED'}
                    />
                    <button
                      type="submit"
                      disabled={!message.trim() || sending || selectedChat.status === 'CLOSED'}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                  {selectedChat.status === 'CLOSED' && (
                    <p className="text-sm text-gray-500 mt-2">This chat has been closed</p>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
