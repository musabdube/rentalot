'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderName: string;
  senderRole: string;
  isAdminMessage: boolean;
  createdAt: string;
  read: boolean;
}

interface Chat {
  id: string;
  status: string;
  messages: Message[];
}

export default function LiveChatWidget() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch chat data
  const fetchChat = async () => {
    try {
      const res = await fetch('/api/live-chat');
      if (res.ok) {
        const data = await res.json();
        setChat(data);
        
        // Count unread admin messages
        const unread = data.messages.filter(
          (msg: Message) => msg.isAdminMessage && !msg.read
        ).length;
        setUnreadCount(unread);

        // Mark messages as read if chat is open
        if (isOpen && unread > 0) {
          await fetch('/api/live-chat', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId: data.id, action: 'markRead' }),
          });
          setUnreadCount(0);
        }
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: chat?.id, content: message }),
      });

      if (res.ok) {
        setMessage('');
        await fetchChat();
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  // Poll for new messages when chat is open
  useEffect(() => {
    if (isOpen && chat) {
      pollingInterval.current = setInterval(fetchChat, 3000); // Poll every 3 seconds
    } else if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [isOpen, chat?.id]);

  // Initial fetch when opening chat
  useEffect(() => {
    if (isOpen && session?.user) {
      fetchChat();
    }
  }, [isOpen, session?.user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chat?.messages) {
      scrollToBottom();
    }
  }, [chat?.messages?.length]);

  // Don't show for admin users
  if (!session?.user || session.user.role === 'ADMIN') {
    return null;
  }

  return (
    <>
      {/* Chat Icon Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition-all z-50 group"
          aria-label="Open live chat"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
          <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chat with Support
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 bg-white rounded-lg shadow-2xl z-50 flex flex-col transition-all ${
            isMinimized ? 'h-14' : 'h-[500px]'
          } sm:w-96`}
        >
          {/* Header */}
          <div className="bg-emerald-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Live Support</h3>
                <p className="text-xs text-emerald-100">We typically reply within minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-emerald-700 p-1 rounded transition-colors"
                aria-label={isMinimized ? 'Maximize chat' : 'Minimize chat'}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                className="hover:bg-emerald-700 p-1 rounded transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {!chat || chat.messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm">Start a conversation with our support team</p>
                    <p className="text-xs mt-1">We're here to help!</p>
                  </div>
                ) : (
                  <>
                    {chat.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isAdminMessage ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-4 py-2 ${
                            msg.isAdminMessage
                              ? 'bg-white border border-gray-200 text-gray-900'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {msg.isAdminMessage && (
                            <p className="text-xs font-semibold text-emerald-600 mb-1">
                              {msg.senderName} (Support)
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.isAdminMessage ? 'text-gray-400' : 'text-emerald-100'
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    disabled={loading || chat?.status === 'CLOSED'}
                  />
                  <button
                    type="submit"
                    disabled={!message.trim() || loading || chat?.status === 'CLOSED'}
                    className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                {chat?.status === 'CLOSED' && (
                  <p className="text-xs text-gray-500 mt-2">
                    This chat has been closed. Open a new chat to continue.
                  </p>
                )}
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
