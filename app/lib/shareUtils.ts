/**
 * Social sharing utilities for generating share URLs
 */

interface ShareOptions {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  hashtags?: string[];
}

/**
 * Generate a Facebook share URL
 */
export function getFacebookShareUrl(url: string): string {
  const encodedUrl = encodeURIComponent(url);
  return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
}

/**
 * Generate a Twitter/X share URL
 */
export function getTwitterShareUrl({ url, title, hashtags }: ShareOptions): string {
  const params = new URLSearchParams();
  params.append('url', url);
  if (title) params.append('text', title);
  if (hashtags && hashtags.length > 0) {
    params.append('hashtags', hashtags.join(','));
  }
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * Generate a WhatsApp share URL
 */
export function getWhatsAppShareUrl({ url, title }: ShareOptions): string {
  const text = title ? `${title}\n${url}` : url;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Generate a LinkedIn share URL
 */
export function getLinkedInShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

/**
 * Generate a Telegram share URL
 */
export function getTelegramShareUrl({ url, title }: ShareOptions): string {
  const params = new URLSearchParams();
  params.append('url', url);
  if (title) params.append('text', title);
  return `https://t.me/share/url?${params.toString()}`;
}

/**
 * Generate an email share URL
 */
export function getEmailShareUrl({ url, title, description }: ShareOptions): string {
  const params = new URLSearchParams();
  if (title) params.append('subject', title);
  const body = description ? `${description}\n\n${url}` : url;
  params.append('body', body);
  return `mailto:?${params.toString()}`;
}

/**
 * Copy URL to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch (error) {
        console.error('Failed to copy:', error);
        textArea.remove();
        return false;
      }
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Use Web Share API if available
 */
export async function nativeShare({ url, title, description }: ShareOptions): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: description,
        url,
      });
      return true;
    } catch (error) {
      // User cancelled or share failed
      console.error('Share failed:', error);
      return false;
    }
  }
  return false;
}

/**
 * Check if Web Share API is available
 */
export function isNativeShareAvailable(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}
