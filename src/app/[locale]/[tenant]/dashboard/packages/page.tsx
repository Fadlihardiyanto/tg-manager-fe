import PageContainer from '@/components/layout/page-container';
import PackageListing from '@/features/packages/components/package-listing';

export const metadata = {
  title: 'Dashboard: Paket'
};

export default function PackagesPage() {
  return (
    <PageContainer pageTitle='Paket' pageDescription='Kelola paket langganan dan harga'>
      <PackageListing />
    </PageContainer>
  );
}
