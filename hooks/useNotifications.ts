'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  getNotifications,
  getUnreadNotificationCount,
  syncPaymentDueNotifications,
} from '@/services/notifications.service';
import type { AppNotification } from '@/types';

type NotificationFetchOptions = {
  /** Load dropdown/list items (heavier). */
  includeList?: boolean;
  listLimit?: number;
  /** Run payment-due sync in background (throttled in service). */
  syncPayments?: boolean;
};

type NotificationFetchResult = {
  items: AppNotification[];
  unread: number;
};

/**
 * Fetches notification data once per call with abort + in-flight guards.
 * Uses stable companyId (not company object) to avoid effect loops.
 */
export function useNotificationFetcher(companyId: string | undefined) {
  const requestIdRef = useRef(0);

  const fetchNotifications = useCallback(
    async (
      options: NotificationFetchOptions = {},
      signal?: AbortSignal
    ): Promise<NotificationFetchResult | null> => {
      if (!companyId) {
        return { items: [], unread: 0 };
      }

      const requestId = ++requestIdRef.current;

      const syncPromise = options.syncPayments
        ? syncPaymentDueNotifications(companyId).catch(() => undefined)
        : Promise.resolve();

      const unreadPromise = getUnreadNotificationCount(companyId);
      const listPromise = options.includeList
        ? getNotifications(companyId, options.listLimit ?? 30)
        : Promise.resolve([] as AppNotification[]);

      await syncPromise;
      if (signal?.aborted || requestId !== requestIdRef.current) return null;

      const [unread, items] = await Promise.all([unreadPromise, listPromise]);
      if (signal?.aborted || requestId !== requestIdRef.current) return null;

      return { unread, items };
    },
    [companyId]
  );

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
    };
  }, [companyId]);

  return { fetchNotifications };
}
