import PageContainer from '@/components/layout/page-container';
import PackageListing from '@/features/packages/components/package-listing';

export const metadata = {
  title: 'Dashboard: Packages'
};

export default function PackagesPage() {
  return (
    <PageContainer
      pageTitle='Paket Langganan'
      pageDescription='Buat dan kelola paket langganan untuk grup Telegram Anda, termasuk harga, durasi, dan level akses.'
    >
      <PackageListing />
    </PageContainer>
  );
}
