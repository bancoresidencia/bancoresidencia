import { NextRequest } from 'next/server';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

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
  /** Quando true, exige estritamente role 'admin' ou 'superadmin' (bloqueia 'curador'). */
  requireStrictAdmin?: boolean;
}

/**
 * Validador rigoroso de autenticação e permissões administrativas/curadoria
 * para rotas do servidor (Next.js Route Handlers).
 *
 * Regras:
 * 1. Suporta M2M seguro via Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>.
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
    const supabaseAdmin = getSupabaseAdmin();
    const checkRole = options?.requireStrictAdmin ? isStrictAdminRole : isPrivilegedRole;
    const forbiddenMessage = options?.requireStrictAdmin
      ? 'Acesso negado: esta operação é restrita exclusivamente a superadministradores.'
      : 'Acesso negado: sua conta não possui privilégios de administrador ou curador.';

    // 1. Verificação via Cabeçalho Authorization
    if (req) {
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        // 1.1 Machine-to-Machine com Service Role Key (comparação em tempo constante)
        if (serviceRoleKey && timingSafeEqualStrings(token, serviceRoleKey)) {
          return {
            authorized: true,
            role: 'service_role',
            status: 200,
            isM2M: true
          };
        }

        // 1.2 Usuário autenticado enviando token JWT Bearer (fallback resiliente para falhas de cookies)
        if (token && token.length > 20 && token.split('.').length === 3) {
          try {
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

    // 2. Validação da sessão de cookies via Supabase Server Client
    let user: User | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user: cookieUser },
        error: userError
      } = await supabase.auth.getUser();

      if (!userError && cookieUser) {
        user = cookieUser;
      }
    } catch {
      // Ignora erro de cookieStore e segue para validação
    }

    if (!user) {
      return {
        authorized: false,
        error: 'Acesso não autorizado: faça login como administrador para continuar.',
        status: 401
      };
    }

    // 3. Checagem em app_metadata (imutável pelo usuário comum)
    const appRole = user.app_metadata?.role as string | undefined;
    if (checkRole(appRole)) {
      return {
        authorized: true,
        user,
        role: appRole,
        status: 200
      };
    }

    // 4. Checagem na tabela public.profiles via Service Role (para não ser bloqueado por RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profileError && profile && checkRole(profile.role)) {
      return {
        authorized: true,
        user,
        role: profile.role,
        status: 200
      };
    }

    return {
      authorized: false,
      error: forbiddenMessage,
      status: 403
    };
  } catch (err) {
    console.error('[AdminAuth] Erro inesperado ao verificar sessão administrativa:', err);
    return {
      authorized: false,
      error: 'Erro interno ao validar autorização de acesso.',
      status: 500
    };
  }
}
