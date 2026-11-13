import { NextRequest, NextResponse } from 'next/server';
import { parseUniversalFlashcardFile } from '@/lib/flashcards/ankiPackageParser';
import { FlashcardImportFormat } from '@/types/flashcards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const format = ((formData.get('format') as string) || 'auto') as FlashcardImportFormat;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Nenhum arquivo enviado para importação.' },
        { status: 400 }
      );
    }

    // Limite de segurança: 50MB
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'O arquivo excede o limite máximo permitido de 50MB.' },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
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
