import { Metadata } from 'next';
import RegisterPageLayout from '@/features/auth/components/register-page-layout';

export const metadata: Metadata = {
  title: 'Daftar - TG-Manager',
  description: 'Buat akun Anda dan mulai otomatisasi manajemen grup Telegram.'
};

export default function RegisterTenantPage() {
  return <RegisterPageLayout />;
}
