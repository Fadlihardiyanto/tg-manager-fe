import type { Metadata } from 'next';
import AdminLoginPageLayout from '@/features/superadmin/components/admin-login-page-layout';

export const metadata: Metadata = {
  title: 'Panel Admin - Urator',
  description: 'Masuk ke dashboard operator platform'
};

export default function SuperadminLoginPage() {
  return <AdminLoginPageLayout />;
}
