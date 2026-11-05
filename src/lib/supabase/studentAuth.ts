import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';

export interface StudentAuthResult {
  authorized: boolean;
  user?: User;
  error?: string;
  status: number;
}

/**
 * Validador rigoroso de autenticação de estudante para Route Handlers da API.
 * 
 * Regras:
 * 1. Suporta cabeçalho Authorization: Bearer <access_token> (testes automatizados e chamadas de API).
 * 2. Suporta cookies de sessão HTTP-only sincronizados via @supabase/ssr no navegador.
 * 3. Retorna status 401 para requisições anônimas ou com tokens expirados/inválidos.
 */
export async function verifyStudentSession(req?: Request): Promise<StudentAuthResult> {
  try {
    // 1. Verificação via Cabeçalho Authorization (Bearer token)
    if (req) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        if (token && token.length > 20) {
          try {
            const supabaseAdmin = getSupabaseAdmin();
            const { data: { user: tokenUser }, error: tokenErr } = await supabaseAdmin.auth.getUser(token);
            if (!tokenErr && tokenUser) {
              return {
                authorized: true,
                user: tokenUser,
                status: 200
              };
            }
          } catch {
            // Continua para tentativa via cookies
          }
        }
      }
    }

    // 2. Verificação via Cookies de Sessão (SSR)
    try {
      const supabaseServer = await createClient();
      const { data: { user: cookieUser }, error: cookieErr } = await supabaseServer.auth.getUser();
      if (!cookieErr && cookieUser) {
        return {
          authorized: true,
          user: cookieUser,
          status: 200
        };
      }
    } catch {
      // Falha ao ler cookies (ex: execução fora de contexto HTTP ou ausência de headers)
    }

    return {
      authorized: false,
      error: 'Acesso não autorizado: faça login para continuar.',
      status: 401
    };
  } catch (err) {
    console.error('[StudentAuth] Erro inesperado ao verificar sessão:', err);
    return {
      authorized: false,
      error: 'Erro interno ao validar autorização de acesso.',
      status: 500
    };
  }
}

