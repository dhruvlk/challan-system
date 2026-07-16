'use client';

import { useCallback, useState } from 'react';
import { DEFAULT_TABLE_PAGE_SIZE, type TablePageSize } from '@/lib/table/pagination';

export function useServerPagination(initialPageSize: TablePageSize = DEFAULT_TABLE_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState<TablePageSize>(initialPageSize);

  const resetPage = useCallback(() => setPage(1), []);

  const setPageSize = useCallback((size: TablePageSize) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    resetPage,
  };
}
