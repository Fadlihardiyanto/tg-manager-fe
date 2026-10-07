import { MemberDetail } from '@/features/members/components/member-detail';
import { MemberDetailSkeleton } from '@/features/members/components/member-detail-drawer';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';

export const metadata = {
  title: 'Detail Member | Dashboard'
};

type PageProps = { params: Promise<{ id: string }> };

export default async function MemberDetailPage(props: PageProps) {
  const { id } = await props.params;

  return (
    <PageContainer pageTitle='Detail Member'>
      <Suspense fallback={<MemberDetailSkeleton />}>
        <MemberDetail memberId={id} />
      </Suspense>
    </PageContainer>
  );
}
