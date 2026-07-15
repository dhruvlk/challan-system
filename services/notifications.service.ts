import { createClient } from '@/lib/supabase/client';
import { isPastDue, resolvePaymentStatus } from '@/lib/payment-status';
import { STOCK_LOW_THRESHOLD } from '@/types';
import type { AppNotification, NotificationType } from '@/types';
import type { NotificationRow } from '@/types/database';

const supabase = () => createClient();

function mapNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    company_id: row.company_id,
    user_id: row.user_id,
    type: row.type as NotificationType,
    title: row.title,
    message: row.message,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    is_read: row.is_read,
    created_at: row.created_at,
  };
}

export async function getNotifications(
  companyId: string,
  limit = 30
): Promise<AppNotification[]> {
  const { data, error } = await supabase()
    .from('notifications')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapNotification);
}

export async function getUnreadNotificationCount(companyId: string): Promise<number> {
  const { count, error } = await supabase()
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('is_read', false);

  if (error) throw error;
  return count ?? 0;
}

export async function createNotification(input: {
  companyId: string;
  type: NotificationType;
  title: string;
  message?: string;
  entityType?: string;
  entityId?: string;
  userId?: string | null;
}): Promise<AppNotification | null> {
  // De-dupe recent identical entity notifications (24h)
  if (input.entityId && input.entityType) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existing } = await supabase()
      .from('notifications')
      .select('id')
      .eq('company_id', input.companyId)
      .eq('type', input.type)
      .eq('entity_type', input.entityType)
      .eq('entity_id', input.entityId)
      .gte('created_at', since)
      .limit(1);

    if (existing?.length) return null;
  }

  const { data, error } = await supabase()
    .from('notifications')
    .insert({
      company_id: input.companyId,
      user_id: input.userId ?? null,
      type: input.type,
      title: input.title,
      message: input.message ?? null,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      is_read: false,
    })
    .select()
    .single();

  if (error) throw error;
  return mapNotification(data);
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase()
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead(companyId: string): Promise<void> {
  const { error } = await supabase()
    .from('notifications')
    .update({ is_read: true })
    .eq('company_id', companyId)
    .eq('is_read', false);
  if (error) throw error;
}

export async function clearNotification(id: string): Promise<void> {
  const { error } = await supabase().from('notifications').delete().eq('id', id);
  if (error) throw error;
}

export async function clearAllNotifications(companyId: string): Promise<void> {
  const { error } = await supabase()
    .from('notifications')
    .delete()
    .eq('company_id', companyId);
  if (error) throw error;
}

/** Create due/overdue payment notifications for open invoices. */
export async function syncPaymentDueNotifications(companyId: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase()
    .from('challans')
    .select('id, challan_number, due_date, grand_total, payment_amount_received, payment_status')
    .eq('company_id', companyId)
    .neq('payment_status', 'Paid');

  if (error || !data) return;

  for (const row of data) {
    const status = resolvePaymentStatus({
      grand_total: Number(row.grand_total ?? 0),
      payment_amount_received: Number(row.payment_amount_received ?? 0),
      due_date: row.due_date,
    });

    if ((status === 'Overdue' || isPastDue(row.due_date)) && status !== 'Paid') {
      await createNotification({
        companyId,
        type: 'overdue_payment',
        title: 'Overdue payment',
        message: `Invoice ${row.challan_number} is overdue.`,
        entityType: 'challan',
        entityId: row.id,
      }).catch(() => undefined);
    } else if (row.due_date === today && status !== 'Paid') {
      await createNotification({
        companyId,
        type: 'payment_due',
        title: 'Payment due today',
        message: `Invoice ${row.challan_number} is due today.`,
        entityType: 'challan',
        entityId: row.id,
      }).catch(() => undefined);
    }
  }
}

export async function notifyStockStatus(input: {
  companyId: string;
  stockId: string;
  quality: string;
  availableTaka: number;
}): Promise<void> {
  if (input.availableTaka <= 0) {
    await createNotification({
      companyId: input.companyId,
      type: 'out_of_stock',
      title: 'Out of stock',
      message: `${input.quality} is out of stock.`,
      entityType: 'stock',
      entityId: input.stockId,
    }).catch(() => undefined);
    return;
  }

  if (input.availableTaka <= STOCK_LOW_THRESHOLD) {
    await createNotification({
      companyId: input.companyId,
      type: 'low_stock',
      title: 'Low stock',
      message: `${input.quality} is low (${input.availableTaka} available).`,
      entityType: 'stock',
      entityId: input.stockId,
    }).catch(() => undefined);
  }
}
