import PageContainer from '@/components/layout/page-container';
import { MidtransSettingsForm } from '@/features/midtrans/components/midtrans-settings-form';

export const metadata = {
  title: 'Dashboard: Midtrans'
};

const midtransHelp = {
  title: 'Panduan Midtrans',
  sections: [
    {
      title: 'Cara mendapatkan API key Midtrans',
      description: 'Ikuti langkah berikut untuk mendapatkan kredensial Midtrans.',
      links: [{ title: 'Buka Dashboard Midtrans', url: 'https://dashboard.midtrans.com' }]
    },
    {
      title: 'Langkah-langkah',
      description:
        '1. Login ke dashboard.midtrans.com\n2. Pilih lingkungan (Sandbox / Production)\n3. Buka Setelan → Kunci Akses\n4. Salin Merchant ID, Client Key & Server Key',
      links: []
    }
  ]
};

export default function MidtransPage() {
  return (
    <PageContainer pageTitle='Midtrans' infoContent={midtransHelp}>
      <MidtransSettingsForm />
    </PageContainer>
  );
}
