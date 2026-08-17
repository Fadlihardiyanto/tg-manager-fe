'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { PageTabs } from '@/components/ui/page-tabs';
import { ReportSettingsForm } from './report-settings-form';
import { ReportFailures } from './report-failures';

const tabs = [
  { value: 'settings', label: 'Pengaturan' },
  { value: 'failures', label: 'Kegagalan' }
];

export function ReportsContent() {
  const [tab, setTab] = useState('settings');

  return (
    <PageContainer
      pageTitle='Laporan'
      pageDescription='Laporan harian otomatis dan pemantauan kegagalan aksi'
    >
      <div className='flex min-h-0 flex-1 flex-col gap-4'>
        <PageTabs value={tab} onValueChange={setTab} items={tabs} />
        {tab === 'settings' ? <ReportSettingsForm /> : <ReportFailures />}
      </div>
    </PageContainer>
  );
}
