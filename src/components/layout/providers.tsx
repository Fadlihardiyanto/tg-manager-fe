'use client';
import React from 'react';
import QueryProvider from './query-provider';
import AuthProvider from './auth-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
