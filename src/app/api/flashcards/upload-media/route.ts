import { NextRequest, NextResponse } from 'next/server';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';
import { isAiRateLimited } from '@/lib/aiProtection';
import {
  convertAndUploadFlashcardMedia,
  MAX_FLASHCARD_IMAGE_BYTES,
} from '@/lib/flashcards/flashcardMediaStorage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
]);

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyStudentSession(req);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { success: false, error: 'Faça login na plataforma para enviar imagens nos flashcards.' },
        { status: 401 }
      );
    }

    if (await isAiRateLimited(`flashcard_media_${auth.user.id}`, 30)) {
      return NextResponse.json(
        { success: false, error: 'Limite temporário de envio de imagens atingido (máx. 30/min).' },
        { status: 429, headers: { 'Retry-After': '30' } }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma imagem foi enviada.' },
        { status: 400 }
      );
    }

    if (file.size <= 0 || file.size > MAX_FLASHCARD_IMAGE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'A imagem deve ter no máximo 8MB.' },
        { status: 413 }
      );
    }

    if (file.type && !ALLOWED_MIME.has(file.type.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Formato não suportado. Utilize PNG, JPG, JPEG, WEBP ou GIF.' },
        { status: 400 }
      );
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await convertAndUploadFlashcardMedia(rawBuffer, auth.user.id);

    return NextResponse.json({
      success: true,
      publicUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao processar imagem do flashcard.';
    console.error('Erro no upload /api/flashcards/upload-media:', err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
