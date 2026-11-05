import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminSession(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Acesso negado: apenas administradores.' },
        { status: auth.status }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const questionId = formData.get('questionId') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Nenhum arquivo enviado.' },
        { status: 400 }
      );
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Arquivo excede o limite máximo permitido de 5MB.' },
        { status: 400 }
      );
    }

    const ALLOWED_EXTS = new Set(['png', 'jpg', 'jpeg', 'webp']);
    const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp']);

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXTS.has(ext) || !ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Formato de arquivo não permitido. Apenas PNG, JPG, JPEG e WEBP são aceitos.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Arquivo excede o limite máximo permitido de 5MB.' },
        { status: 400 }
      );
    }

    const safeQId = (questionId || 'question').replace(/[^a-zA-Z0-9_-]/g, '_');
    const storagePath = `remedied/${safeQId}_${Date.now()}.${ext}`;

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.storage
      .from('questoes')
      .upload(storagePath, buffer, {
        contentType: file.type || 'image/png',
        upsert: true
      });

    if (error) {
      console.error('Erro no upload Supabase Storage:', error);
      return NextResponse.json(
        { success: false, error: `Falha no Supabase Storage: ${error.message}` },
        { status: 500 }
      );
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/questoes/${storagePath}`;

    return NextResponse.json({
      success: true,
      publicUrl,
      storagePath
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro interno no upload.';
    console.error('Erro no upload /api/admin/medevo/upload:', err);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
