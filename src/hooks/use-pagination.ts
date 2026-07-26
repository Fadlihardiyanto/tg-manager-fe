import { useCallback } from 'react';
import { useQueryState, parseAsInteger } from 'nuqs';

const LIMIT_OPTIONS = [10, 20, 50, 100];

export function usePagination() {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(20));
  const safeLimit = LIMIT_OPTIONS.includes(limit) ? limit : 20;

  const handleLimitChange = useCallback(
    (v: string) => {
      setLimit(Number(v));
      setPage(1);
    },
    [setLimit, setPage]
  );

  return { page, setPage, limit: safeLimit, handleLimitChange, limitOptions: LIMIT_OPTIONS };
}
