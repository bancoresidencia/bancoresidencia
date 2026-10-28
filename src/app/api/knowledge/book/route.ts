import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import catalogData from '@/data/medicalKnowledgeCatalog.json';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'placeholder-key';
  return createSupabaseAdminClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

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

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (rateLimitMap.size > 2000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (val.resetAt < now) {
        rateLimitMap.delete(key);
      }
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
