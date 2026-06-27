import { Metadata } from 'next';
import LoginPageLayout from '@/features/auth/components/login-page-layout';

export const metadata: Metadata = {
  title: 'Login - TeleCommand',
  description: 'Login to your tenant dashboard'
};

export default function LoginPage() {
  return <LoginPageLayout />;
}
