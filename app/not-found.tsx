'use client';

import Link from 'next/link';
import { Home, ArrowRight, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Main Content */}
        <div className="text-center mb-12">
          {/* 404 Icon */}
          <div className="mb-8 inline-flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-lg border-4 border-emerald-100">
            <span className="text-7xl font-bold text-emerald-600">404</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-4">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Description */}
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            It might have been removed, renamed, or you may have mistyped the URL. Let's get you back on track.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-emerald-600 hover:text-emerald-600 font-semibold transition-colors"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
              Go Back
            </button>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-center gap-2">
              <Search className="w-5 h-5 text-emerald-600" />
              Explore Popular Pages
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/browse"
                className="p-4 rounded-lg bg-slate-50 hover:bg-emerald-50 transition-colors border border-gray-200 hover:border-emerald-300 group"
              >
                <div className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors mb-1">
                  Browse Properties
                </div>
                <div className="text-sm text-gray-600">Find your dream home</div>
              </Link>

              <Link
                href="/compare"
                className="p-4 rounded-lg bg-slate-50 hover:bg-emerald-50 transition-colors border border-gray-200 hover:border-emerald-300 group"
              >
                <div className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors mb-1">
                  Compare Listings
                </div>
                <div className="text-sm text-gray-600">Side by side comparison</div>
              </Link>

              <Link
                href="/auth/signin"
                className="p-4 rounded-lg bg-slate-50 hover:bg-emerald-50 transition-colors border border-gray-200 hover:border-emerald-300 group"
              >
                <div className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors mb-1">
                  Sign In
                </div>
                <div className="text-sm text-gray-600">Access your account</div>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Decoration */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Need help? <Link href="/contact" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Contact us
            </Link>
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
}
