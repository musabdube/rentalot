'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/app/components/Header';
import { ArrowLeft, Edit, Trash2, Eye, Clock, CheckCircle, XCircle, FileText, ThumbsUp, ThumbsDown } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  category: string;
  upvotes: number;
  downvotes: number;
  views: number;
  createdAt: string;
  publishedAt: string | null;
  reviewedBy: { name: string } | null;
  rejectionReason: string | null;
}

export default function MyPostsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchPosts();
    }
  }, [status, router]);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/blog?myPosts=true');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load your posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch('/api/blog', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Post deleted successfully');
        setPosts(posts.filter((p) => p.id !== id));
      } else {
        console.error('Delete error:', res.status, data);
        toast.error(data.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredPosts = (posts || []).filter((post) => {
    if (filter === 'all') return true;
    return post.status.toLowerCase() === filter.toLowerCase();
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
    };
    return styles[status as keyof typeof styles] || styles.DRAFT;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <FileText className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          <Link
            href="/blog/create"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            Create New Post
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Blog Posts</h1>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'draft', 'pending', 'approved', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === tab
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Posts List */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "You haven't created any blog posts yet."
                : `You don't have any ${filter} posts.`}
            </p>
            <Link
              href="/blog/create"
              className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Create Your First Post
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusBadge(post.status)}`}>
                        {getStatusIcon(post.status)}
                        {post.status}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                    {post.excerpt && (
                      <p className="text-gray-600 mb-3">{post.excerpt}</p>
                    )}
                    {post.status === 'REJECTED' && post.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-700">{post.rejectionReason}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4 text-emerald-600" />
                        {post.upvotes}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsDown className="w-4 h-4 text-red-600" />
                        {post.downvotes}
                      </span>
                      <span>
                        Created: {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2">
                    {post.status === 'APPROVED' && (
                      <Link
                        href={`/blog/${post.slug}`}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    )}
                    {(post.status === 'DRAFT' || post.status === 'REJECTED') && (
                      <button
                        onClick={() => router.push(`/blog/edit/${post.id}`)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-medium"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
