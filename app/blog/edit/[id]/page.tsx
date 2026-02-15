'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/app/components/Header';
import { ArrowLeft, Save, Send, X, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function EditBlogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    category: 'general',
    hashtags: '',
  });

  useEffect(() => {
    if (status === 'authenticated' && params.id) {
      fetchPost();
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, params.id]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/blog?myPosts=true`);
      if (res.ok) {
        const data = await res.json();
        const post = data.posts?.find((p: any) => p.id === params.id);
        
        if (post) {
          setFormData({
            title: post.title,
            content: post.content,
            excerpt: post.excerpt || '',
            coverImage: post.coverImage || '',
            category: post.category,
            hashtags: post.hashtags.join(', '),
          });
        } else {
          toast.error('Post not found');
          router.push('/blog/my-posts');
        }
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setFormData({ ...formData, coverImage: dataUrl });
        setUploadingImage(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read file');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, coverImage: '' });
  };

  const handleSubmit = async (newStatus: 'DRAFT' | 'PENDING') => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setSaving(true);
    try {
      const hashtags = formData.hashtags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const res = await fetch('/api/blog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: params.id,
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          coverImage: formData.coverImage,
          category: formData.category,
          hashtags,
          status: newStatus,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Post updated successfully!');
        router.push('/blog/my-posts');
      } else {
        console.error('API Error:', data);
        toast.error(data.error || 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/blog/my-posts"
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Posts
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Blog Post</h1>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter a catchy title..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="general">General</option>
                <option value="entertainment">Entertainment</option>
                <option value="resources">Resources</option>
                <option value="problems">Problems</option>
                <option value="news">News</option>
              </select>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt (Optional)
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                placeholder="Brief summary of your post..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Write your post content here..."
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.content.length} characters
              </p>
            </div>

            {/* Hashtags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hashtags (Optional)
              </label>
              <input
                type="text"
                value={formData.hashtags}
                onChange={(e) =>
                  setFormData({ ...formData, hashtags: e.target.value })
                }
                placeholder="harare, entertainment, belvedere (comma separated, no # needed)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter hashtags separated by commas. Example: harare, entertainment, student-friendly
              </p>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image (Optional)
              </label>
              {formData.coverImage ? (
                <div className="relative">
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-300">
                    <Image
                      src={formData.coverImage}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadingImage ? (
                      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="mb-2 text-sm text-gray-700 font-semibold">
                          Click to upload cover image
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleSubmit('DRAFT')}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                Save as Draft
              </button>
              <button
                onClick={() => handleSubmit('PENDING')}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              >
                <Send className="w-5 h-5" />
                {saving ? 'Updating...' : 'Update & Submit for Review'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
