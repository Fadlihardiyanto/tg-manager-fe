'use client';

import { PageTabs } from '@/components/ui/page-tabs';
import { parseAsString, useQueryState } from 'nuqs';

const tabs = [
  { value: 'active', label: 'Member Aktif' },
  { value: 'migration', label: 'Migrasi Member' }
];

export function MembersPageTabs() {
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsString.withDefault('active').withOptions({ shallow: false, history: 'replace' })
  );

  return <PageTabs value={tab} onValueChange={setTab} items={tabs} />;
}
