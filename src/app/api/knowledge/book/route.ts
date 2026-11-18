import { NextRequest, NextResponse } from 'next/server';
import catalogData from '@/data/medicalKnowledgeCatalog.json';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';

export const dynamic = 'force-dynamic';

// Conjunto com todos os storagePaths permitidos no catálogo oficial
const allowedStoragePaths = new Set<string>();
for (const spec of Object.values(catalogData.specialties || {})) {
  if (Array.isArray(spec.books)) {
    for (const b of spec.books) {
      if (b.storagePath) {
        allowedStoragePaths.add(b.storagePath);
      }
    }
  }
}

// In-Memory Rate Limiter: Máximo de 30 livros baixados por minuto por IP
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;
const MAX_RATE_LIMIT_ENTRIES = 5000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (rateLimitMap.size >= MAX_RATE_LIMIT_ENTRIES) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (val.resetAt < now) {
        rateLimitMap.delete(key);
      }
    }
    while (rateLimitMap.size >= MAX_RATE_LIMIT_ENTRIES) {
      const oldestKey = rateLimitMap.keys().next().value;
      if (oldestKey === undefined) break;
      rateLimitMap.delete(oldestKey);
    }
  }

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  entry.count++;
  return false;
}

export async function GET(req: NextRequest) {
  try {
    // 0. Bloqueio absoluto: nenhum aluno ou visitante tem acesso ao download direto de livros.
    // Acesso exclusivo a processos internos (M2M Service Role) e curadores/administradores da plataforma.
    const auth = await verifyAdminSession(req);
    if (!auth.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: 'Acesso restrito exclusivamente ao motor de inteligência médica e curadoria interna.'
        },
        { status: 403 }
      );
    }

    // 1. Rate limiting por IP
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'unknown-ip';

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limite de consulta ao acervo temporariamente excedido. Aguarde alguns instantes.'
        },
        {
          status: 429,
          headers: { 'Retry-After': '30' }
        }
      );
    }

    const { searchParams } = new URL(req.url);
    const storagePath = searchParams.get('path');

    if (!storagePath) {
      return NextResponse.json(
        { success: false, error: 'Parâmetro path obrigatório.' },
        { status: 400 }
      );
    }

    // 2. Proteção contra Path Traversal e caracteres proibidos
    if (
      storagePath.includes('..') ||
      storagePath.includes('\\') ||
      storagePath.includes('\0') ||
      !storagePath.endsWith('.json')
    ) {
      return NextResponse.json(
        { success: false, error: 'Caminho de livro inválido.' },
        { status: 400 }
      );
    }

    // 3. Validação rigorosa contra a whitelist oficial do acervo
    if (!allowedStoragePaths.has(storagePath)) {
      return NextResponse.json(
        { success: false, error: 'Livro não encontrado no catálogo oficial autorizado.' },
        { status: 404 }
      );
    }

    // 4. Download seguro via Service Role no servidor (sem expor bucket medical-knowledge para anon)
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.storage
      .from('medical-knowledge')
      .download(storagePath);

    if (error || !data) {
      console.error('[API Knowledge Book] Erro ao baixar livro do Supabase Storage:', error);
      return NextResponse.json(
        { success: false, error: 'Conteúdo do livro indisponível no momento.' },
        { status: 502 }
      );
    }

    const text = await data.text();
    const parsed = JSON.parse(text);

    return NextResponse.json(
      { success: true, data: parsed },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=3600, stale-while-revalidate=86400'
        }
      }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno do servidor';
    console.error('[API Knowledge Book] Exceção:', err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
