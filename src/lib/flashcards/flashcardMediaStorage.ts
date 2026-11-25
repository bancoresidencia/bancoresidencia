import crypto from 'node:crypto';
import sharp from 'sharp';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';

export const FLASHCARD_MEDIA_BUCKET = 'flashcard-media';
export const MAX_FLASHCARD_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB

let bucketVerified = false;

function looksLikeTextOrSvg(buffer: Buffer): boolean {
  const head = buffer.subarray(0, 256).toString('utf8').trimStart().toLowerCase();
  return head.startsWith('<svg') || head.startsWith('<?xml') || head.startsWith('<html') || head.startsWith('<!doctype');
}

async function ensureFlashcardMediaBucket(): Promise<void> {
  if (bucketVerified) return;
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.storage.createBucket(FLASHCARD_MEDIA_BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/webp', 'image/png', 'image/jpeg', 'image/gif'],
  });
  if (!error || /already exists|duplicate/i.test(error.message)) {
    bucketVerified = true;
  }
}

/**
 * Valida magic bytes via Sharp, normaliza orientação/dimensão, converte para WebP
 * e faz upload deduplicado por SHA-256 no bucket flashcard-media do usuário.
 */
export async function convertAndUploadFlashcardMedia(
  rawBuffer: Buffer,
  userId: string
): Promise<string> {
  if (!rawBuffer || rawBuffer.length === 0) {
    throw new Error('Buffer de imagem vazio.');
  }
  if (rawBuffer.length > MAX_FLASHCARD_IMAGE_BYTES) {
    throw new Error('Imagem excede o limite máximo permitido de 8MB.');
  }
  if (looksLikeTextOrSvg(rawBuffer)) {
    throw new Error('Imagens vetoriais SVG ou documentos HTML não são permitidos por segurança.');
  }

  let cleanWebpBuffer: Buffer;
  try {
    cleanWebpBuffer = await sharp(rawBuffer, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 84, effort: 4 })
      .toBuffer();
  } catch {
    throw new Error('Arquivo corrompido ou formato de imagem inválido.');
  }

  const hash = crypto.createHash('sha256').update(cleanWebpBuffer).digest('hex').slice(0, 32);
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'student';
  const storagePath = `${safeUserId}/${hash}.webp`;

  const supabaseAdmin = getSupabaseAdmin();
  let { error } = await supabaseAdmin.storage
    .from(FLASHCARD_MEDIA_BUCKET)
    .upload(storagePath, cleanWebpBuffer, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: true,
    });

  if (error && /bucket.*not found|404/i.test(error.message)) {
    await ensureFlashcardMediaBucket();
    const retry = await supabaseAdmin.storage
      .from(FLASHCARD_MEDIA_BUCKET)
      .upload(storagePath, cleanWebpBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: true,
      });
    error = retry.error;
  }

  if (error) {
    throw new Error(`Falha ao gravar imagem no Storage: ${error.message}`);
  }

  bucketVerified = true;
  const { data } = supabaseAdmin.storage.from(FLASHCARD_MEDIA_BUCKET).getPublicUrl(storagePath);
  if (data?.publicUrl) {
    return data.publicUrl;
  }

  const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  return `${baseUrl}/storage/v1/object/public/${FLASHCARD_MEDIA_BUCKET}/${storagePath}`;
}
