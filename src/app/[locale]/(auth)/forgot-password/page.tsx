import { Metadata } from 'next';
import ForgotPasswordPageLayout from '@/features/auth/components/forgot-password-page-layout';

export const metadata: Metadata = {
  title: 'Forgot Password - TeleCommand',
  description: 'Reset your password'
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageLayout />;
}
