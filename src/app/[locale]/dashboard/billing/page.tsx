import PageContainer from '@/components/layout/page-container';
import { ActivePlanPage } from '@/features/billing/components/active-plan-page';

export const metadata = {
  title: 'Dashboard: Billing'
};

export default function BillingPage() {
  return (
    <PageContainer
      pageTitle='Billing & Plan'
      pageDescription='Lihat plan tenant aktif, kuota yang masih tersedia, dan jalur upgrade plan.'
    >
      <ActivePlanPage />
    </PageContainer>
  );
}
