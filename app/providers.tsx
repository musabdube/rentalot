'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/app/components/ToastProvider';
import ProfileCompletionPrompt from '@/app/components/ProfileCompletionPrompt';

export function NextAuthSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider />
      <ProfileCompletionPrompt />
      {children}
    </SessionProvider>
  );
}
