import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { OverviewContent } from '@/features/overview/components/overview-content';
import { Icons } from '@/components/icons';

export const metadata = {
  title: 'Dashboard: Dasbor'
};

const quickActions = [
  { label: 'Tambah Bot', href: '/dashboard/bots', icon: Icons.robot },
  { label: 'Hubungkan Grup', href: '/dashboard/groups', icon: Icons.teams },
  { label: 'Buat Broadcast', href: '/dashboard/broadcast', icon: Icons.send },
  { label: 'Kelola Paket', href: '/dashboard/packages', icon: Icons.product }
];

export default function OverviewPage() {
  return (
    <PageContainer pageTitle='Dasbor' pageDescription='Pantau performa bisnis Anda'>
      <OverviewContent />

      {/* Quick Actions */}
      <div className='flex flex-wrap gap-3'>
        {quickActions.map((action) => (
          <Button key={action.href} asChild variant='outline' size='sm' className='rounded-full'>
            <Link href={action.href}>
              <action.icon className='mr-2 size-4' />
              {action.label}
            </Link>
          </Button>
        ))}
      </div>
    </PageContainer>
  );
}
