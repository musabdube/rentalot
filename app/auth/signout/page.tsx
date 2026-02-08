'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';

export default function SignOutPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-8 text-center">
          <LogOut className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign Out</h1>
          <p className="text-gray-600 mb-2">
            {session?.user?.name && `Goodbye, ${session.user.name}!`}
            {session?.user?.email && !session.user.name && `Goodbye, ${session.user.email}!`}
            {!session?.user?.name && !session?.user?.email && 'Are you sure you want to sign out?'}
          </p>

          <button
            onClick={handleSignOut}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors mt-6"
          >
            Confirm Sign Out
          </button>

          <button
            onClick={() => router.back()}
            className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors mt-3"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
