'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { parseAsString, useQueryState } from 'nuqs';

export function MembersPageTabs() {
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsString.withDefault('active').withOptions({ shallow: false, history: 'replace' })
  );

  return (
    <Tabs value={tab} onValueChange={setTab} className='space-y-4'>
      <TabsList>
        <TabsTrigger value='active'>Member Aktif</TabsTrigger>
        <TabsTrigger value='migration'>Migration & Import</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
