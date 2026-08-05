import PageContainer from '@/components/layout/page-container';
import { TransactionsListingContent } from '@/features/transactions/components/transactions-listing-content';

export const metadata = {
  title: 'Dashboard: Transaksi'
};

export default function TransactionsPage() {
  return (
    <PageContainer pageTitle='Transaksi' pageDescription='Transaksi pembelian paket oleh member.'>
      <TransactionsListingContent />
    </PageContainer>
  );
}
