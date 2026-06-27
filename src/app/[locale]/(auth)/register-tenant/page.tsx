import { Metadata } from 'next';
import RegisterPageLayout from '@/features/auth/components/register-page-layout';

export const metadata: Metadata = {
  title: 'Sign Up - TeleCommand',
  description:
    'Create your account and join the automation revolution for Telegram.'
};

export default function RegisterTenantPage() {
  return <RegisterPageLayout />;
}
