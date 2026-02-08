'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  receiver: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ViewingDetails {
  id: string;
  propertyTitle: string;
  tenantId: string;
  tenantName: string;
  landlordId: string;
  landlordName: string;
  status: string;
}

interface ViewingMessagesProps {
  viewingId: string;
  otherUserId: string;
  otherUserName: string;
}

export function ViewingMessages({ viewingId, otherUserId, otherUserName }: ViewingMessagesProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [viewing, setViewing] = useState<ViewingDetails | null>(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [viewingId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/viewings/${viewingId}/messages`);
      if (!response.ok) {
        console.error('Failed to fetch messages');
        return;
      }

      const data = await response.json();
      setMessages(data.messages);
      setViewing(data.viewing);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim()) {
      return;
    }

    setSending(true);

    try {
      const response = await fetch(`/api/viewings/${viewingId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText.trim(),
          receiverId: otherUserId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to send message');
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
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 text-center">
        <p className="text-gray-600">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col" style={{ height: '500px' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Chat with {otherUserName}</h3>
          <p className="text-sm text-emerald-100">{viewing?.propertyTitle}</p>
        </div>
        <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
          {viewing?.status}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 text-center">
              No messages yet. Start a conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end ${msg.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
            >
              {msg.senderId !== session?.user?.id && (
                <img src={msg.sender.avatar || '/placeholder-avatar.png'} alt={msg.sender.name} className="w-8 h-8 rounded-full mr-3 object-cover" />
              )}

              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.senderId === session?.user?.id
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                }`}
              >
                <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                  {msg.sender.name}
                </p>
                <p className="break-words">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.senderId === session?.user?.id
                      ? 'text-emerald-100'
                      : 'text-gray-500'
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {msg.senderId === session?.user?.id && (
                <img src={msg.sender.avatar || session?.user?.image || '/placeholder-avatar.png'} alt={msg.sender.name} className="w-8 h-8 rounded-full ml-3 object-cover" />
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
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
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !messageText.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
