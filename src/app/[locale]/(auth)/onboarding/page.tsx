import type { Metadata } from 'next';
import OnboardingFlow from '@/features/onboarding/components/onboarding-flow';

export const metadata: Metadata = {
  title: 'Onboarding - Urator',
  description:
    'Selesaikan pengaturan awal akun Urator Anda untuk mulai mengelola grup Telegram berbayar.'
};

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
