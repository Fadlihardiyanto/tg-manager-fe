import PageContainer from '@/components/layout/page-container';
import { ActivePlanPage } from '@/features/billing/components/active-plan-page';

export const metadata = {
  title: 'Dashboard: Penagihan'
};

export default function BillingPage() {
  return (
    <PageContainer pageTitle='Paket Billing'>
      <ActivePlanPage />
    </PageContainer>
  );
}
