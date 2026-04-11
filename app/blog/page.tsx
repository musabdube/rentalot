'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Header } from '@/app/components/Header';
import { 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  Calendar, 
  Tag, 
  Plus, 
  TrendingUp, 
  Clock,
  Search,
  Hash,
  ThumbsUp,
  ThumbsDown,
  BookOpen
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  hashtags: string[];
  category: string;
  upvotes: number;
  downvotes: number;
  views: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  userVote?: 'UPVOTE' | 'DOWNVOTE' | null;
  publishedAt: string;
  createdAt: string;
}

export default function BlogPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHashtag, setSelectedHashtag] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');

  const categories = [
    { value: 'all', label: 'All Posts' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'resources', label: 'Resources' },
    { value: 'problems', label: 'Problems' },
    { value: 'news', label: 'News' },
    { value: 'general', label: 'General' },
  ];

  useEffect(() => {
    fetchPosts();
  }, [selectedHashtag, selectedCategory, sortBy]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedHashtag) params.append('hashtag', selectedHashtag);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (sortBy) params.append('sortBy', sortBy);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/blog?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId: string, voteType: 'UPVOTE' | 'DOWNVOTE') => {
    if (!session) {
      alert('Please sign in to vote on posts');
      return;
    }

    try {
      const res = await fetch('/api/blog/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, voteType }),
      });

      if (res.ok) {
        // Refresh posts to get updated counts
        fetchPosts();
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  // Extract all unique hashtags from posts
  const allHashtags = Array.from(
    new Set(posts.flatMap((post) => post.hashtags))
  ).slice(0, 20);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 flex justify-center items-center gap-3"><BookOpen className="w-10 h-10" />Community Blog</h1>
            <p className="text-lg sm:text-xl text-emerald-50 mb-6">
              Share experiences, resources, and insights about your area
            </p>
            {session && session.user.role !== 'ADMIN' && (
              <Link
                href="/blog/create"
                className="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Post
              </Link>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  selectedCategory === cat.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            {[
              { value: 'recent', label: 'Recent', icon: Clock },
              { value: 'popular', label: 'Popular', icon: ArrowUp },
              { value: 'trending', label: 'Trending', icon: TrendingUp },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setSortBy(value as any)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Selected Hashtag */}
          {selectedHashtag && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Filtering by:</span>
              <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                <Hash className="w-4 h-4" />
                {selectedHashtag}
                <button
                  onClick={() => setSelectedHashtag('')}
                  className="hover:text-emerald-900"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Trending Hashtags */}
        {allHashtags.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-600" />
              Popular Hashtags
            </h3>
            <div className="flex flex-wrap gap-2">
              {allHashtags.map((hashtag) => (
                <button
                  key={hashtag}
                  onClick={() => setSelectedHashtag(hashtag)}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                >
                  {hashtag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-gray-600 text-lg">No blog posts found</p>
            {session && session.user.role !== 'ADMIN' && (
              <Link
                href="/blog/create"
                className="inline-flex items-center gap-2 mt-4 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create First Post
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="flex">
                  {/* Vote Section */}
                  <div className="bg-gray-50 p-4 flex flex-col items-center justify-start gap-2 border-r border-gray-200">
                    <button
                      onClick={() => handleVote(post.id, 'UPVOTE')}
                      className={`p-2 rounded-lg transition-colors ${
                        post.userVote === 'UPVOTE'
                          ? 'bg-emerald-600 text-white'
                          : 'text-gray-600 hover:bg-emerald-100 hover:text-emerald-600'
                      }`}
                      disabled={!session}
                      title={!session ? 'Sign in to vote' : 'Upvote'}
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-base text-emerald-600">
                          {post.upvotes}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsDown className="w-4 h-4 text-red-600" />
                        <span className="font-bold text-base text-red-600">
                          {post.downvotes}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleVote(post.id, 'DOWNVOTE')}
                      className={`p-2 rounded-lg transition-colors ${
                        post.userVote === 'DOWNVOTE'
                          ? 'bg-red-600 text-white'
                          : 'text-gray-600 hover:bg-red-100 hover:text-red-600'
                      }`}
                      disabled={!session}
                      title={!session ? 'Sign in to vote' : 'Downvote'}
                    >
                      <ArrowDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-2xl font-bold text-gray-900 hover:text-emerald-600 transition-colors"
                        >
                          {post.title}
                        </Link>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            By {post.author.name}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.views} views
                          </span>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium capitalize">
                        {post.category}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>

                    {/* Hashtags */}
                    {post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.hashtags.slice(0, 5).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSelectedHashtag(tag)}
                            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}

                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                    >
                      Read more →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
