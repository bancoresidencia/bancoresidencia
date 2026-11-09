import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

/**
 * Algoritmo Cirúrgico de Inpainting e Remoção de Marca d'Água Médica:
 * - Detecta imagens predominantemente médicas/monocromáticas (radiografias, tomografias, ressonâncias, ECGs)
 * - Isola a contaminação cromática (azul/laranja da MedEvo) e elevação sutil de luminância
 * - Restaura a textura de fundo e gradiente anatômico sem introduzir artefatos
 */
export async function sanitizeMedicalWatermark(rawBuffer: Buffer, location: string = 'centro'): Promise<Buffer> {
  const image = sharp(rawBuffer);
  const meta = await image.metadata();
  const width = meta.width || 600;
  const height = meta.height || 400;

  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const channels = info.channels;
  const out = Buffer.from(data);

  // 1. Determina se a imagem é predominantemente monocromática (radiologia médica)
  // Amostra a borda perimétrica (livre de marcas d'água centrais)
  let totalChroma = 0;
  let sampleCount = 0;
  for (let y = 10; y < Math.min(50, height); y++) {
    for (let x = 10; x < width - 10; x += 5) {
      const idx = (y * width + x) * channels;
      totalChroma += Math.max(Math.abs(data[idx] - data[idx + 1]), Math.abs(data[idx + 1] - data[idx + 2]));
      sampleCount++;
    }
  }
  const isMedicalMonochrome = sampleCount > 0 ? (totalChroma / sampleCount) < 3.0 : true;

  // 2. Define a região de contenção com base na localização auditada pelo Gemini
  let minX = Math.floor(width * 0.20);
  let maxX = Math.floor(width * 0.80);
  let minY = Math.floor(height * 0.20);
  let maxY = Math.floor(height * 0.80);

  const loc = (location || '').toLowerCase();
  if (loc.includes('centro') || loc.includes('central')) {
    minX = Math.floor(width * 0.25);
    maxX = Math.floor(width * 0.75);
    minY = Math.floor(height * 0.25);
    maxY = Math.floor(height * 0.75);
  } else if (loc.includes('canto superior direito')) {
    minX = Math.floor(width * 0.65);
    maxX = width;
    minY = 0;
    maxY = Math.floor(height * 0.35);
  } else if (loc.includes('canto inferior direito')) {
    minX = Math.floor(width * 0.65);
    maxX = width;
    minY = Math.floor(height * 0.65);
    maxY = height;
  }

  // 3. Aplica remoção cirúrgica
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      if (isMedicalMonochrome) {
        // Converte para escala de cinza padrão Rec. 601
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
          const chroma = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
          if (chroma > 1) {
            // Elimina o bump de brilho introduzido pela transparência da marca d'água
            const delta = Math.round(chroma * 0.85);
            const corrected = Math.max(0, Math.min(255, gray - delta));
            out[idx] = corrected;
            out[idx + 1] = corrected;
            out[idx + 2] = corrected;
            continue;
          }
        }
        out[idx] = gray;
        out[idx + 1] = gray;
        out[idx + 2] = gray;
      } else {
        // Se a imagem for naturalmente colorida (dermatologia, histologia)
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
          const chromaBlue = b - Math.max(r, g);
          const chromaOrange = (r - b > 15 && g - b > 8);
          if (chromaBlue > 10 || chromaOrange) {
            // Suaviza interpolação com vizinho
            const leftIdx = (y * width + Math.max(0, x - 1)) * channels;
            out[idx] = data[leftIdx];
            out[idx + 1] = data[leftIdx + 1];
            out[idx + 2] = data[leftIdx + 2];
          }
        }
      }
    }
  }

  return sharp(out, { raw: { width, height, channels } })
    .webp({ quality: 90, effort: 4 })
    .toBuffer();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('url');
    const location = searchParams.get('location') || 'centro';

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: 'URL da imagem ausente' }, { status: 400 });
    }

    // Se for URL da MedEvo direta, não fazemos requisição para proteger privacidade
    if (/medevo\.com\.br/i.test(imageUrl)) {
      return NextResponse.json({ success: false, error: 'URL protegida pelo escudo anti-vazamento' }, { status: 403 });
    }

    // Baixa o buffer da imagem (do Supabase ou local)
    const res = await fetch(imageUrl);
    if (!res.ok) {
      return NextResponse.json({ success: false, error: `Falha ao carregar imagem: HTTP ${res.status}` }, { status: 404 });
    }

    const rawBuffer = Buffer.from(await res.arrayBuffer());
    const cleanBuffer = await sanitizeMedicalWatermark(rawBuffer, location);

    return new NextResponse(new Uint8Array(cleanBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=86400, immutable'
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro no inpainting';
    console.error('Erro no preview de inpainting:', err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
