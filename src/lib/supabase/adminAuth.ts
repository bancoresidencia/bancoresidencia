import { NextRequest } from 'next/server';
import { User } from '@supabase/supabase-js';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';

import { isPrivilegedRole, isStrictAdminRole } from '@/utils/security';
import { timingSafeEqualStrings } from '@/utils/serverCrypto';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';

export interface AdminAuthResult {
  authorized: boolean;
  user?: User;
  role?: string;
  error?: string;
  status: number;
  isM2M?: boolean;
}

export interface VerifyAdminOptions {
  requireStrictAdmin?: boolean;
  allowM2M?: boolean;
}

/**
 * Validador rigoroso de autenticação e permissões administrativas/curadoria
 * para rotas do servidor (Next.js Route Handlers).
 *
 * Regras:
 * 1. Suporta M2M seguro via Authorization: Bearer <ADMIN_M2M_TOKEN>.
 * 2. Suporta token JWT Bearer do usuário autenticado via Authorization: Bearer <access_token>.
 * 3. Valida cookies de sessão assinados via Supabase Auth (SSR).
 * 4. Valida se o usuário possui role privilegiada em app_metadata ou na tabela profiles.
 * 5. NUNCA confia em user_metadata (para evitar privilege escalation).
 */
export async function verifyAdminSession(
  req?: NextRequest,
  options?: VerifyAdminOptions
): Promise<AdminAuthResult> {
  try {
    const checkRole = options?.requireStrictAdmin ? isStrictAdminRole : isPrivilegedRole;
    const forbiddenMessage = options?.requireStrictAdmin
      ? 'Acesso negado: esta operação é restrita exclusivamente a superadministradores.'
      : 'Acesso negado: sua conta não possui privilégios de administrador ou curador.';

    // 1. Verificação via Cabeçalho Authorization
    if (req) {
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        const adminToken = process.env.ADMIN_M2M_TOKEN;

        // 1.1 Machine-to-Machine com token dedicado (comparação em tempo constante)
        if (adminToken && timingSafeEqualStrings(token, adminToken)) {
          const testUserId = req.headers.get('x-test-user-id') || 'admin_m2m_service';
          return {
            authorized: true,
            user: {
              id: testUserId,
              email: 'admin@bancoresidencia.com.br',
              app_metadata: { role: 'superadmin' },
              user_metadata: { name: 'Admin M2M' },
              aud: 'authenticated',
              created_at: new Date().toISOString()
            } as User,
            role: 'service_role',
            status: 200,
            isM2M: true
          };
        }

        // 1.2 Usuário autenticado enviando token JWT Bearer (fallback resiliente para falhas de cookies)
        if (token && token.length > 20 && token.split('.').length === 3) {
          try {
            const supabaseAdmin = getSupabaseAdmin();
            const { data: { user: tokenUser }, error: tokenErr } = await supabaseAdmin.auth.getUser(token);
            if (!tokenErr && tokenUser) {
              const appRole = tokenUser.app_metadata?.role as string | undefined;
              if (checkRole(appRole)) {
                return {
                  authorized: true,
                  user: tokenUser,
                  role: appRole,
                  status: 200
                };
              }

              const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('role')
                .eq('id', tokenUser.id)
                .maybeSingle();

              if (profile && checkRole(profile.role)) {
                return {
                  authorized: true,
                  user: tokenUser,
                  role: profile.role,
                  status: 200
                };
              }

              return {
                authorized: false,
                error: forbiddenMessage,
                status: 403
              };
            }
          } catch {
            // Continua para validação por cookies
          }
        }
      }
    }

    const session = await verifyStudentSession(req);
    if (!session.authorized || !session.user) {
      return { authorized: false, status: session.status, error: session.error };
    }

    const { user } = session;
    const { data: profile, error } = await getSupabaseAdmin()
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    if (error) throw error;

    if (profile && checkRole(profile.role)) {
      return { authorized: true, user, role: profile.role, status: 200 };
    }

    return {
      authorized: false,
      status: 403,
      error: 'Acesso negado: sua conta não possui os privilégios necessários.'
    };
  } catch {
    return {
      authorized: false,
      error: 'Erro interno ao validar autorização de acesso.',
      status: 500
    };
  }
}
