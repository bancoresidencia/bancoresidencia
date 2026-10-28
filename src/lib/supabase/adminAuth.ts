import { NextRequest } from 'next/server';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

import { isPrivilegedRole } from '@/utils/security';

export interface AdminAuthResult {
  authorized: boolean;
  user?: User;
  role?: string;
  error?: string;
  status: number;
  isM2M?: boolean;
}

/**
 * Validador rigoroso de autenticação e permissões administrativas/curadoria
 * para rotas do servidor (Next.js Route Handlers).
 *
 * Regras:
 * 1. Suporta M2M seguro via Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>.
 * 2. Em chamadas de browser, valida os cookies de sessão assinados via Supabase Auth.
 * 3. Valida se o usuário possui role 'admin', 'curador' ou 'curator' em app_metadata ou na tabela profiles.
 * 4. NUNCA confia em user_metadata (para evitar privilege escalation).
 */
export async function verifyAdminSession(req?: NextRequest): Promise<AdminAuthResult> {
  try {
    // 1. Suporte a Machine-to-Machine com Service Role Key
    if (req) {
      const authHeader = req.headers.get('authorization');
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (authHeader && serviceRoleKey) {
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        if (token === serviceRoleKey) {
          return {
            authorized: true,
            role: 'service_role',
            status: 200,
            isM2M: true
          };
        }
      }
    }

    // 2. Validação da sessão de cookies via Supabase Server Client
    const supabase = await createClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        authorized: false,
        error: 'Acesso não autorizado: faça login como administrador para continuar.',
        status: 401
      };
    }

    // 3. Checagem em app_metadata (imutável pelo usuário comum)
    const appRole = user.app_metadata?.role as string | undefined;
    if (isPrivilegedRole(appRole)) {
      return {
        authorized: true,
        user,
        role: appRole,
        status: 200
      };
    }

    // 4. Checagem na tabela public.profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profileError && profile && isPrivilegedRole(profile.role)) {
      return {
        authorized: true,
        user,
        role: profile.role,
        status: 200
      };
    }

    return {
      authorized: false,
      error: 'Acesso negado: sua conta não possui privilégios de administrador ou curador.',
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
