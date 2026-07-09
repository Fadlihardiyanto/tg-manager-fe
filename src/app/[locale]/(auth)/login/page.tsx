import { Metadata } from 'next';
import LoginPageLayout from '@/features/auth/components/login-page-layout';

export const metadata: Metadata = {
  title: 'Masuk - TG-Manager',
  description: 'Masuk ke dashboard tenant Anda'
};

export default function LoginPage() {
  return <LoginPageLayout />;
}
