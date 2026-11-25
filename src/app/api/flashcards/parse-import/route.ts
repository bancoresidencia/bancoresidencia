import { NextRequest, NextResponse } from 'next/server';
import { parseUniversalFlashcardFile } from '@/lib/flashcards/ankiPackageParser';
import { convertAndUploadFlashcardMedia } from '@/lib/flashcards/flashcardMediaStorage';
import { FlashcardImportFormat } from '@/types/flashcards';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';
import { isAiRateLimited } from '@/lib/aiProtection';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_IMPORT_MEDIA_IMAGES = 150;
const MEDIA_UPLOAD_CONCURRENCY = 6;

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

    // Limite de segurança: 50MB (suporta pacotes Anki com imagens médicas)
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'O arquivo excede o limite máximo permitido de 50MB.' },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'O arquivo excede o limite máximo permitido de 50MB.' },
        { status: 413 }
      );
    }
    const buffer = Buffer.from(arrayBuffer);

    const result = parseUniversalFlashcardFile(buffer, file.name, format);

    const mediaEntries = result.mediaFiles ? Object.entries(result.mediaFiles) : [];
    const uploadedMediaMap = new Map<string, string>();
    let uploadedCount = 0;
    let failedCount = 0;
    const skippedLimit = Math.max(0, mediaEntries.length - MAX_IMPORT_MEDIA_IMAGES);

    if (mediaEntries.length > 0) {
      const toProcess = mediaEntries.slice(0, MAX_IMPORT_MEDIA_IMAGES);
      for (let i = 0; i < toProcess.length; i += MEDIA_UPLOAD_CONCURRENCY) {
        const chunk = toProcess.slice(i, i + MEDIA_UPLOAD_CONCURRENCY);
        await Promise.all(
          chunk.map(async ([refName, imgBuffer]) => {
            try {
              const publicUrl = await convertAndUploadFlashcardMedia(imgBuffer, auth.user!.id);
              uploadedMediaMap.set(refName, publicUrl);
              uploadedCount++;
            } catch {
              failedCount++;
            }
          })
        );
      }
    }

    const enrichedCards = result.cards.map((card) => {
      const resolvedFrontUrl =
        card.imageFrontUrl ||
        (card.frontImageRef ? uploadedMediaMap.get(card.frontImageRef) : undefined);
      const resolvedBackUrl =
        card.imageUrl ||
        (card.backImageRef ? uploadedMediaMap.get(card.backImageRef) : undefined);

      return {
        front: card.front,
        back: card.back,
        comment: card.comment,
        imageFrontUrl: resolvedFrontUrl,
        imageUrl: resolvedBackUrl,
        specialty: card.specialty,
        theme: card.theme,
        focus: card.focus,
        subfocus: card.subfocus,
        deckId: card.deckId,
        sourceDeckName: card.sourceDeckName,
        priority: card.priority,
        studyDepth: card.studyDepth,
        tags: card.tags,
        rawLineIndex: card.rawLineIndex,
      };
    });

    return NextResponse.json({
      success: true,
      fileName: file.name,
      detectedFormat: result.detectedFormat,
      detectedDeckName: result.detectedDeckName,
      mediaStats: {
        totalReferenced: mediaEntries.length,
        uploaded: uploadedCount,
        failed: failedCount,
        skippedLimit,
      },
      cards: enrichedCards,
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
