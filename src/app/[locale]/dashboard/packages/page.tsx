import PageContainer from '@/components/layout/page-container';
import PackageListing from '@/features/packages/components/package-listing';

export const metadata = {
  title: 'Dashboard: Packages'
};

export default function PackagesPage() {
  return (
    <PageContainer
      pageTitle='Subscription Packages'
      pageDescription='Create and manage subscription packages for your Telegram groups — set pricing, duration, and access level.'
    >
      <PackageListing />
    </PageContainer>
  );
}
