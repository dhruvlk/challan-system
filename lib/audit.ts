import { createClient } from '@/lib/supabase/client';

/**
 * Future-ready audit helper. Safe to call from services; failures are swallowed.
 */
export async function recordAuditEvent(input: {
  companyId: string;
  action: string;
  module?: string;
  entityType?: string;
  entityId?: string;
  employeeName?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from('audit_logs').insert({
      company_id: input.companyId,
      user_id: user?.id ?? null,
      employee_name: input.employeeName ?? null,
      action: input.action,
      module: input.module ?? null,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      metadata: (input.metadata ?? {}) as never,
      ip_address: null,
    });
  } catch {
    // Intentional no-op — audit must never break business flows
  }
}
