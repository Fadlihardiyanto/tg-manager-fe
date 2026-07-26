'use client';
import React from 'react';
import QueryProvider from './query-provider';
import AuthProvider from './auth-provider';
import SuperadminAuthProvider from './superadmin-auth-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <SuperadminAuthProvider>{children}</SuperadminAuthProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
