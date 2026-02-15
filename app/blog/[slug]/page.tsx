'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/app/components/Header';
import { ArrowLeft, Eye, Clock, User, ThumbsUp, ThumbsDown, Tag } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  hashtags: string[];
  upvotes: number;
  downvotes: number;
  views: number;
  createdAt: string;
  publishedAt: string | null;
  author: {
    id: string;
    name: string;
    email: string;
  };
  userVote?: {
    voteType: string;
  } | null;
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchPost();
    }
  }, [params.slug]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/blog/${params.slug}`);
      const data = await res.json();
      
      if (res.ok) {
        setPost(data);
      } else {
        console.error('API Error:', res.status, data);
        if (res.status === 404) {
          toast.error('Post not found');
          router.push('/blog');
        } else if (res.status === 403) {
          toast.error('This post is not available');
          router.push('/blog');
        } else if (res.status === 500) {
          toast.error('Database error - Blog tables may not exist. Run migration first.');
        } else {
          toast.error(data.error || 'Failed to load post');
        }
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to load post. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType: 'UPVOTE' | 'DOWNVOTE') => {
    if (!session) {
      toast.error('Please sign in to vote');
      router.push('/auth/signin');
      return;
    }

    setVoting(true);
    try {
      const res = await fetch('/api/blog/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post?.id,
          voteType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPost((prev) =>
          prev
            ? {
                ...prev,
                upvotes: data.upvotes,
                downvotes: data.downvotes,
                userVote: data.userVote,
              }
            : null
        );
        toast.success('Vote recorded');
      } else {
        toast.error('Failed to vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return null;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/blog"
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <article className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative w-full h-64 sm:h-80 md:h-96">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* Category & Date */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Eye className="w-4 h-4" />
                {post.views} views
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-2 mb-6 pb-6 border-b">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700 font-medium">{post.author.name}</span>
            </div>

            {/* Voting Section */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <button
                onClick={() => handleVote('UPVOTE')}
                disabled={voting}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  post.userVote?.voteType === 'UPVOTE'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ThumbsUp className="w-5 h-5" />
                {post.upvotes}
              </button>
              <button
                onClick={() => handleVote('DOWNVOTE')}
                disabled={voting}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  post.userVote?.voteType === 'DOWNVOTE'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ThumbsDown className="w-5 h-5" />
                {post.downvotes}
              </button>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-8">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {post.content}
              </div>
            </div>

            {/* Hashtags */}
            {post.hashtags.length > 0 && (
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-5 h-5 text-gray-400" />
                  {post.hashtags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?hashtag=${encodeURIComponent(tag)}`}
                      className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium hover:bg-emerald-100 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Related Posts Section (Can be added later) */}
      </main>
    </div>
  );
}
