import { Metadata } from 'next';
import ForgotPasswordPageLayout from '@/features/auth/components/forgot-password-page-layout';

export const metadata: Metadata = {
  title: 'Lupa Kata Sandi - Urator',
  description: 'Atur ulang kata sandi Anda'
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageLayout />;
}
