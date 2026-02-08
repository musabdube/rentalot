'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/app/components/ToastProvider';

export function NextAuthSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider />
      {children}
    </SessionProvider>
  );
}
