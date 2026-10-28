import { createClient } from '@supabase/supabase-js';

export interface AuditEventParams {
  userId?: string | null;
  userEmail?: string | null;
  userRole?: string;
  action:
    | 'UPDATE_GABARITO'
    | 'ANULATE_QUESTION'
    | 'RESTORE_QUESTION'
    | 'RESOLVE_REPORT'
    | 'GENERATE_COMMENTARY'
    | 'MANUAL_OVERRIDE'
    | 'BULK_IMPORT';
  entityType: 'question' | 'question_report' | 'exam' | 'user' | 'system';
  entityId: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  reason?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'placeholder-key';
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
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
      user_agent: params.userAgent ? params.userAgent.slice(0, 500) : null,
      created_at: new Date().toISOString()
    };

    const { error } = await supabaseAdmin.from('audit_logs').insert(payload);

    if (error) {
      // Se a tabela ainda não existir no ambiente de testes ou antes da migração, apenas loga warning
      console.warn('[Audit Log] Aviso ao registrar auditoria no Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido ao registrar auditoria';
    console.warn('[Audit Log] Exceção capturada ao registrar auditoria:', msg);
    return { success: false, error: msg };
  }
}
