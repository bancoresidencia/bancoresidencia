import { NextRequest, NextResponse } from 'next/server';
import { parseUniversalFlashcardFile } from '@/lib/flashcards/ankiPackageParser';
import { FlashcardImportFormat } from '@/types/flashcards';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';
import { isAiRateLimited } from '@/lib/aiProtection';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyStudentSession(req);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { success: false, error: 'Faça login na plataforma para importar baralhos de flashcards.' },
        { status: 401 }
      );
    }

    // Rate limiting estrito por usuário autenticado contra DoS síncrono no Event Loop (máx 6 uploads/min)
    // Backed pelo Supabase — serverless-safe (não usa Map in-memory)
    if (await isAiRateLimited(`anki_import_${auth.user.id}`, 6)) {
      return NextResponse.json(
        { success: false, error: 'Limite de importações atingido temporariamente (máx. 6/min). Aguarde um instante.' },
        { status: 429, headers: { 'Retry-After': '30' } }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const format = ((formData.get('format') as string) || 'auto') as FlashcardImportFormat;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Nenhum arquivo enviado para importação.' },
        { status: 400 }
      );
    }

    // Limite estrito de segurança: 25MB
    const MAX_FILE_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'O arquivo excede o limite máximo permitido de 25MB.' },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'O arquivo excede o limite máximo permitido de 25MB.' },
        { status: 413 }
      );
    }
    const buffer = Buffer.from(arrayBuffer);

    const result = parseUniversalFlashcardFile(buffer, file.name, format);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      detectedFormat: result.detectedFormat,
      detectedDeckName: result.detectedDeckName,
      cards: result.cards
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha ao processar arquivo de flashcards.';
    console.error('Erro ao processar arquivo de flashcards:', err);
    return NextResponse.json(
      {
        success: false,
        error: message
      },
      { status: 422 }
    );
  }
}
