'use client';

import { AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Callback: 'There was an issue with the authentication callback.',
    OAuthSignin: 'Error signing in with OAuth provider.',
    OAuthCallback: 'Error in OAuth callback.',
    EmailCreateAccount: 'Could not create user account.',
    OAuthAccountNotLinked: 'Email is already associated with another account.',
    EmailSignInError: 'Could not sign in with email.',
    CredentialsSignin: 'Invalid credentials provided.',
    default: 'An authentication error occurred.',
  };

  const message = error ? errorMessages[error] || errorMessages.default : errorMessages.default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Auth Error</h1>
          <p className="text-gray-600 mb-6">{message}</p>

          <Link
            href="/auth/signin"
            className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
