import React from 'react';
import { Header } from '@/app/components/Header';
import TenantSidebar from './TenantSidebar';

export const metadata = {
  title: 'Tenant',
};

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        <TenantSidebar />

        <main className="flex-1">
          <div className="bg-white rounded-lg shadow-sm p-6 min-h-[60vh]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
