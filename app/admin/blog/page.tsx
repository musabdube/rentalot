'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Eye, Clock, FileText, User, Tag, ThumbsUp, ThumbsDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  hashtags: string[];
  status: string;
  upvotes: number;
  downvotes: number;
  views: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  reviewedBy: { name: string } | null;
  rejectionReason: string | null;
}

export default function AdminBlogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('PENDING');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }

    if (status === 'authenticated' && session?.user.role === 'ADMIN') {
      fetchPosts();
    }
  }, [status, session, router, filter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blog?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (postId: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/blog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          action,
          rejectionReason: action === 'reject' ? rejectionReason : undefined,
        }),
      });

      if (res.ok) {
        toast.success(`Post ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
        setSelectedPost(null);
        setRejectionReason('');
        fetchPosts();
      } else {
        toast.error(`Failed to ${action} post`);
      }
    } catch (error) {
      console.error(`Error ${action}ing post:`, error);
      toast.error(`Failed to ${action} post`);
    } finally {
      setActionLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      general: 'bg-gray-100 text-gray-700',
      entertainment: 'bg-purple-100 text-purple-700',
      resources: 'bg-blue-100 text-blue-700',
      problems: 'bg-red-100 text-red-700',
      news: 'bg-green-100 text-green-700',
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
    };
    return styles[status as keyof typeof styles] || styles.DRAFT;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FileText className="w-6 h-6 text-emerald-600" />Blog Management</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText className="w-4 h-4" />
          {(posts || []).length} {(posts || []).length === 1 ? 'post' : 'posts'}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['PENDING', 'APPROVED', 'REJECTED', 'DRAFT'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === tab
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (posts || []).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
          <p className="text-gray-600">There are no {filter.toLowerCase()} posts.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(posts || []).map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(post.status)}`}>
                      {post.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>

                  {post.excerpt && (
                    <p className="text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <User className="w-4 h-4" />
                    <span>{post.author.name}</span>
                    <span>•</span>
                    <Clock className="w-4 h-4" />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <Eye className="w-4 h-4" />
                    <span>{post.views} views</span>
                  </div>

                  {post.hashtags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <Tag className="w-4 h-4 text-gray-400" />
                      {post.hashtags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {post.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason:</p>
                      <p className="text-sm text-red-700">{post.rejectionReason}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4 text-emerald-600" />
                      {post.upvotes}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsDown className="w-4 h-4 text-red-600" />
                      {post.downvotes}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2">
                  <button
                    onClick={() => setSelectedPost(post)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  {post.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleAction(post.id, 'approve')}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          // Will show rejection reason input in modal
                        }}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Preview Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Review Post</h2>
                <button
                  onClick={() => {
                    setSelectedPost(null);
                    setRejectionReason('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedPost.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(selectedPost.category)}`}>
                      {selectedPost.category}
                    </span>
                    <span className="text-sm text-gray-500">by {selectedPost.author.name}</span>
                  </div>
                </div>

                {selectedPost.coverImage && (
                  <img
                    src={selectedPost.coverImage}
                    alt={selectedPost.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}

                {selectedPost.excerpt && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Excerpt:</h4>
                    <p className="text-gray-600">{selectedPost.excerpt}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Content:</h4>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap text-gray-700">{selectedPost.content}</p>
                  </div>
                </div>

                {selectedPost.hashtags.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Hashtags:</h4>
                    <div className="flex gap-2 flex-wrap">
                      {selectedPost.hashtags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPost.status === 'PENDING' && (
                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason (optional for rejection)
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why this post is being rejected..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAction(selectedPost.id, 'approve')}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-5 h-5" />
                        {actionLoading ? 'Processing...' : 'Approve Post'}
                      </button>
                      <button
                        onClick={() => handleAction(selectedPost.id, 'reject')}
                        disabled={actionLoading || !rejectionReason.trim()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-5 h-5" />
                        {actionLoading ? 'Processing...' : 'Reject Post'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
