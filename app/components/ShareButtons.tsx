'use client';

import { useState } from 'react';
import { Facebook, Twitter, Linkedin, MessageCircle, Send, Mail, Copy, Share2 } from 'lucide-react';
import {
  getFacebookShareUrl,
  getTwitterShareUrl,
  getWhatsAppShareUrl,
  getLinkedInShareUrl,
  getTelegramShareUrl,
  getEmailShareUrl,
  copyToClipboard,
  nativeShare,
  isNativeShareAvailable,
} from '../lib/shareUtils';
import toast from 'react-hot-toast';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  className?: string;
  showLabels?: boolean;
}

export default function ShareButtons({
  url,
  title,
  description,
  hashtags,
  className = '',
  showLabels = false,
}: ShareButtonsProps) {
  const [showNativeShare] = useState(isNativeShareAvailable());

  const handleNativeShare = async () => {
    const success = await nativeShare({ url, title, description });
    if (!success) {
      toast.error('Share cancelled');
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(url);
    if (success) {
      toast.success('Link copied to clipboard!');
    } else {
      toast.error('Failed to copy link');
    }
  };

  const shareButtons = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: getFacebookShareUrl(url),
      color: 'hover:bg-blue-600 hover:text-white',
      borderColor: 'border-blue-600',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: getTwitterShareUrl({ url, title, hashtags }),
      color: 'hover:bg-sky-500 hover:text-white',
      borderColor: 'border-sky-500',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: getWhatsAppShareUrl({ url, title }),
      color: 'hover:bg-green-600 hover:text-white',
      borderColor: 'border-green-600',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: getLinkedInShareUrl(url),
      color: 'hover:bg-blue-700 hover:text-white',
      borderColor: 'border-blue-700',
    },
    {
      name: 'Telegram',
      icon: Send,
      url: getTelegramShareUrl({ url, title }),
      color: 'hover:bg-blue-500 hover:text-white',
      borderColor: 'border-blue-500',
    },
    {
      name: 'Email',
      icon: Mail,
      url: getEmailShareUrl({ url, title, description }),
      color: 'hover:bg-gray-600 hover:text-white',
      borderColor: 'border-gray-600',
    },
  ];

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {showNativeShare && (
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-2 px-4 py-2 border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors"
          aria-label="Share"
        >
          <Share2 className="w-4 h-4" />
          {showLabels && <span className="text-sm font-medium">Share</span>}
        </button>
      )}
      
      {shareButtons.map((button) => (
        <a
          key={button.name}
          href={button.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-4 py-2 border-2 ${button.borderColor} rounded-lg transition-colors ${button.color}`}
          aria-label={`Share on ${button.name}`}
        >
          <button.icon className="w-4 h-4" />
          {showLabels && <span className="text-sm font-medium">{button.name}</span>}
        </a>
      ))}

      <button
        onClick={handleCopyLink}
        className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 text-gray-600 rounded-lg hover:bg-gray-400 hover:text-white transition-colors"
        aria-label="Copy link"
      >
        <Copy className="w-4 h-4" />
        {showLabels && <span className="text-sm font-medium">Copy Link</span>}
      </button>
    </div>
  );
}
