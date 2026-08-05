import PageContainer from '@/components/layout/page-container';
import { MidtransSettingsForm } from '@/features/midtrans/components/midtrans-settings-form';

export const metadata = {
  title: 'Dashboard: Midtrans'
};

export default function MidtransPage() {
  return (
    <PageContainer
      pageTitle='Midtrans'
      pageDescription='Atur kredensial Midtrans untuk pembayaran member.'
    >
      <MidtransSettingsForm />
    </PageContainer>
  );
}
