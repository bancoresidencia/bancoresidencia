import { getSupabaseAdmin } from '@/lib/supabase/adminClient';

export interface AuditEventParams {
  userId?: string | null;
  userEmail?: string | null;
  userRole?: string;
  action:
    | 'UPDATE_GABARITO'
    | 'ANULATE_QUESTION'
    | 'RESTORE_QUESTION'
    | 'RESOLVE_REPORT'
    | 'UPDATE_REPORT_STATUS'
    | 'GENERATE_COMMENTARY'
    | 'MANUAL_OVERRIDE'
    | 'BULK_IMPORT'
    | 'SUBSCRIPTION_UPDATE'
    | 'ROLE_UPDATE'
    | 'PAYOUT_PROCESS'
    | 'REFUND_PROCESS';
  entityType: 'question' | 'question_report' | 'exam' | 'user' | 'system';
  entityId: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  reason?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Registra um evento imutável de auditoria no PostgreSQL.
 * Este registro é append-only: não permite alteração ou exclusão posterior.
 */
export async function recordAuditEvent(params: AuditEventParams): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const payload = {
      user_id: params.userId || null,
      user_email: params.userEmail || null,
      user_role: params.userRole || 'admin',
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      old_values: params.oldValues || null,
      new_values: params.newValues || null,
      reason: params.reason || null,
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
      created_at: new Date().toISOString()
    };

    const { error } = await supabaseAdmin.from('audit_logs').insert(payload);

    if (error) {
      console.warn('[AuditLog] Aviso ao persistir log de auditoria:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha ao registrar auditoria';
    console.warn('[AuditLog] Exceção ao gravar log de auditoria:', msg);
    return { success: false, error: msg };
  }
}
