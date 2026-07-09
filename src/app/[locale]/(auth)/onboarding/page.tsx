import type { Metadata } from 'next';
import OnboardingFlow from '@/features/onboarding/components/onboarding-flow';

export const metadata: Metadata = {
  title: 'Onboarding - TG-Manager',
  description:
    'Selesaikan pengaturan awal akun TG-Manager Anda untuk mulai mengelola grup Telegram berbayar.'
};

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
