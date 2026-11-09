import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { sanitizeMedicalWatermark } from './inpaint/route';

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

interface VisionHit {
  url: string;
  presence_type: string;
  location: string;
  confidence: number;
  details: string;
}

interface ManifestQuestion {
  id: string;
  code: string;
  banca: string;
  year: number;
  hasTextHit: boolean;
  textHits: Array<{ field: string; match: string; snippet: string }>;
  hasImageHit: boolean;
  images: Array<{
    url: string;
    field: string;
    visionAudit?: {
      audited: boolean;
      has_medevo: boolean;
      confidence: number;
      presence_type: string;
      location: string;
      details: string;
    };
  }>;
  hasVisionHit?: boolean;
  visionHits?: VisionHit[];
}

interface LiveQuestionRow {
  id: string;
  code: string;
  banca: string;
  institution?: string;
  year: number;
  especialidade?: string;
  tema?: string;
  statement: string;
  commentary?: string;
  options?: Array<{ letter: string; text: string; justification?: string }>;
  images?: string[] | string;
  is_anulada?: boolean;
  correct_answer?: string;
}

let cachedManifest: ManifestQuestion[] | null = null;
let cachedRemediedFiles: string[] | null = null;

async function getRemediedFiles(supabaseAdmin: ReturnType<typeof getSupabaseAdmin>): Promise<string[]> {
  if (cachedRemediedFiles) return cachedRemediedFiles;
  try {
    const { data, error } = await supabaseAdmin.storage.from('questoes').list('remedied', { limit: 1000 });
    if (!error && data) {
      cachedRemediedFiles = data.map((d: { name: string }) => d.name);
      return cachedRemediedFiles;
    }
  } catch (err) {
    console.error('Erro ao listar remedied no Supabase:', err);
  }
  return [];
}

function resolveRemediedUrl(id: string, code: string, field: string, files: string[]): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ezluharxlmlqhdkqrjbz.supabase.co';
  const prefix = `${baseUrl}/storage/v1/object/public/questoes/remedied/`;

  // 1. Match por ID (UUID)
  const byId = files.find(f => f.startsWith(id));
  if (byId) return `${prefix}${byId}`;

  // 2. Match por Code e Campo
  if (code) {
    if (field && field.startsWith('options[')) {
      const letter = field.match(/options\[(.*?)\]/)?.[1];
      const matchOpt = files.find(f => f.startsWith(code) && f.includes(`_opt_${letter}`));
      if (matchOpt) return `${prefix}${matchOpt}`;
    }
    if (field && field.includes('statement')) {
      const matchStmt = files.find(f => f.startsWith(code) && f.includes('_stmt_'));
      if (matchStmt) return `${prefix}${matchStmt}`;
    }
    const byCode = files.find(f => f.startsWith(code));
    if (byCode) return `${prefix}${byCode}`;
  }
  return null;
}

function resolveOfficialUrl(id: string, code: string, field: string): string | null {
  const officialDir = path.join(process.cwd(), 'public', 'images', 'oficiais');
  if (!fs.existsSync(officialDir)) return null;

  try {
    const files = fs.readdirSync(officialDir);
    // 1. Match exato por Code e Campo
    if (code) {
      if (field && field.startsWith('options[')) {
        const letter = field.match(/options\[(.*?)\]/)?.[1];
        const matchOpt = files.find(f => f.startsWith(code) && f.includes(`_opt_${letter}`));
        if (matchOpt) return `/images/oficiais/${matchOpt}`;
      }
      const matchCode = files.find(f => f.startsWith(code));
      if (matchCode) return `/images/oficiais/${matchCode}`;
    }
    // 2. Match por ID
    if (id) {
      const matchId = files.find(f => f.startsWith(id));
      if (matchId) return `/images/oficiais/${matchId}`;
    }
  } catch (err) {
    console.error('Erro ao buscar imagem oficial local:', err);
  }
  return null;
}

function getManifest(): ManifestQuestion[] {
  try {
    const manifestPath = path.join(process.cwd(), 'src', 'data', 'medevoAuditManifest.json');
    if (fs.existsSync(manifestPath)) {
      const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      cachedManifest = raw.questions || [];
      return cachedManifest!;
    }
  } catch (err) {
    console.error('Erro ao ler medevoAuditManifest.json:', err);
  }
  return [];
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminSession(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Acesso negado: apenas administradores.' },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '15', 10)));
    const filter = searchParams.get('filter') || 'all'; // all, text, image, vision, both, clean, pending
    const banca = searchParams.get('banca') || 'all';
    const search = (searchParams.get('search') || '').trim().toLowerCase();

    const manifest = getManifest();

    // 1. Filtragem preliminar do manifesto
    const filtered = manifest.filter(q => {
      // Filtros de Categoria
      if (filter === 'text' && !q.hasTextHit) return false;
      if (filter === 'image' && !q.hasImageHit) return false;
      if (filter === 'vision' && !q.hasVisionHit) return false;
      if (filter === 'both' && (!q.hasTextHit || !q.hasImageHit)) return false;

      // Filtro de Banca
      if (banca !== 'all' && q.banca !== banca) return false;

      // Busca por texto/código
      if (search) {
        const matchesCode = (q.code || '').toLowerCase().includes(search);
        const matchesBanca = (q.banca || '').toLowerCase().includes(search);
        const matchesId = q.id.toLowerCase().includes(search);
        const matchesSnippet = q.textHits?.some(th => th.snippet.toLowerCase().includes(search));
        const matchesVision = q.visionHits?.some(vh => vh.details.toLowerCase().includes(search));
        if (!matchesCode && !matchesBanca && !matchesId && !matchesSnippet && !matchesVision) return false;
      }

      return true;
    });

    const totalCount = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedIds = filtered.slice(startIndex, startIndex + pageSize).map(q => q.id);

    // 2. Busca o estado ATUAL e REAL de cada questão no Supabase
    const supabaseAdmin = getSupabaseAdmin();
    let liveQuestions: LiveQuestionRow[] = [];
    if (paginatedIds.length > 0) {
      const { data, error } = await supabaseAdmin
        .from('questions')
        .select('id, code, banca, institution, year, especialidade, tema, statement, commentary, options, images, is_anulada, correct_answer')
        .in('id', paginatedIds);

      if (error) {
        console.error('Erro ao buscar questoes no Supabase:', error);
      } else {
        liveQuestions = (data as unknown as LiveQuestionRow[]) || [];
      }
    }

    // Indexa live data por ID
    const liveMap = new Map(liveQuestions.map(q => [q.id, q]));

    // 3. Monta o payload final enriquecido com análise de pendência
    const remediedFiles = await getRemediedFiles(supabaseAdmin);

    const enrichedQuestions = filtered.slice(startIndex, startIndex + pageSize).map(manifestItem => {
      const live = liveMap.get(manifestItem.id) || null;

      // Verifica se ainda tem menção ao medevo no banco
      const currentStatement = live?.statement || '';
      const currentCommentary = live?.commentary || '';
      const currentOptions = Array.isArray(live?.options) ? live.options : [];
      const currentImages = Array.isArray(live?.images) ? live.images : (typeof live?.images === 'string' ? [live.images] : []);

      const hasTextInDb = /med[-_ ]?evo/i.test(currentStatement) ||
        /med[-_ ]?evo/i.test(currentCommentary) ||
        currentOptions.some(opt => /med[-_ ]?evo/i.test(opt.text || '') || /med[-_ ]?evo/i.test(opt.justification || ''));

      const hasMedevoImagesInDb = currentImages.some((img: string) => /medevo/i.test(img)) ||
        currentOptions.some(opt => typeof opt.text === 'string' && /medevo/i.test(opt.text));

      const isClean = !hasTextInDb && !hasMedevoImagesInDb && !manifestItem.hasVisionHit;

      // Enriquece imagens do manifesto com URL remediada existente no Supabase Storage
      const enrichedManifestImages = (manifestItem.images || []).map(img => {
        const liveRemedied = currentImages.find(i => i.includes('/remedied/')) ||
          resolveRemediedUrl(manifestItem.id, live?.code || manifestItem.code, img.field, remediedFiles);

        const officialUrl = resolveOfficialUrl(manifestItem.id, live?.code || manifestItem.code, img.field);

        return {
          ...img,
          migratedUrl: liveRemedied || null,
          remediedUrl: liveRemedied || null,
          officialUrl: officialUrl || null
        };
      });

      return {
        id: manifestItem.id,
        code: live?.code || manifestItem.code,
        banca: live?.banca || manifestItem.banca,
        year: live?.year || manifestItem.year,
        institution: live?.institution || manifestItem.banca,
        especialidade: live?.especialidade || '',
        tema: live?.tema || '',
        statement: live?.statement || '',
        commentary: live?.commentary || '',
        options: currentOptions,
        images: currentImages,
        correct_answer: live?.correct_answer || '',
        is_anulada: live?.is_anulada || false,
        manifestHits: manifestItem.textHits || [],
        manifestImages: enrichedManifestImages,
        hasVisionHit: Boolean(manifestItem.hasVisionHit),
        visionHits: manifestItem.visionHits || [],
        hasTextInDb,
        hasMedevoImagesInDb,
        isClean
      };
    });

    let resultItems = enrichedQuestions;
    if (filter === 'clean') {
      resultItems = resultItems.filter(q => q.isClean);
    } else if (filter === 'pending') {
      resultItems = resultItems.filter(q => !q.isClean);
    }

    const bancaCounts: Record<string, number> = {};
    manifest.forEach(q => {
      bancaCounts[q.banca] = (bancaCounts[q.banca] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: resultItems,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      },
      stats: {
        totalManifest: manifest.length,
        textHits: manifest.filter(q => q.hasTextHit).length,
        imageHits: manifest.filter(q => q.hasImageHit).length,
        visionHits: manifest.filter(q => q.hasVisionHit).length,
        bothHits: manifest.filter(q => q.hasTextHit && q.hasImageHit).length,
        bancas: bancaCounts
      }
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro interno ao consultar auditoria.';
    console.error('Erro no GET /api/admin/medevo:', err);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

function updateManifestQuestionClean(questionId: string, updatedUrlPair?: { oldUrl: string; newUrl: string }) {
  try {
    const manifestPath = path.join(process.cwd(), 'src', 'data', 'medevoAuditManifest.json');
    if (!fs.existsSync(manifestPath)) return;
    const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const qIndex = raw.questions?.findIndex((q: ManifestQuestion) => q.id === questionId);
    if (qIndex !== -1) {
      const q = raw.questions[qIndex];
      q.hasVisionHit = false;
      q.isApprovedClean = true;
      q.approvedAt = new Date().toISOString();
      if (updatedUrlPair && Array.isArray(q.images)) {
        q.images.forEach((img: { url: string; visionAudit?: { has_medevo: boolean } }) => {
          if (img.url === updatedUrlPair.oldUrl) {
            img.url = updatedUrlPair.newUrl;
            if (img.visionAudit) img.visionAudit.has_medevo = false;
          }
        });
      }
      fs.writeFileSync(manifestPath, JSON.stringify(raw, null, 2), 'utf8');
      cachedManifest = raw.questions;
    }
  } catch (err) {
    console.error('Erro ao sincronizar medevoAuditManifest.json:', err);
  }
}

// Upload manual de imagem para o Supabase Storage (questoes)
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
    const questionCode = (formData.get('questionCode') as string) || 'generic';

    if (!file) {
      return NextResponse.json({ success: false, error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // Higienização obrigatória via Sharp: descarta metadados EXIF e converte para WebP 85%
    const cleanBuffer = await sharp(rawBuffer)
      .webp({ quality: 85, effort: 4 })
      .toBuffer();

    const cleanCode = questionCode.replace(/[^a-zA-Z0-9_-]/g, '_');
    const storagePath = `sanitized/${cleanCode}_${Date.now()}.webp`;

    const supabaseAdmin = getSupabaseAdmin();
    const { error: uploadErr } = await supabaseAdmin.storage
      .from('questoes')
      .upload(storagePath, cleanBuffer, {
        contentType: 'image/webp',
        upsert: true
      });

    if (uploadErr) {
      throw new Error(`Falha no Supabase Storage: ${uploadErr.message}`);
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('questoes')
      .getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      size: cleanBuffer.length
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao processar upload.';
    console.error('Erro no POST /api/admin/medevo:', err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

// Atualização atômica direta no Supabase
export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAdminSession(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Acesso negado: apenas administradores.' },
        { status: auth.status }
      );
    }

    const body = await req.json();
    const { questionId, statement, commentary, options, images, action, oldUrl, newUrl } = body;

    if (!questionId || typeof questionId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'ID da questão ausente ou inválido.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Se a ação for homologar questão como limpa
    if (action === 'approve_clean') {
      updateManifestQuestionClean(questionId);
      return NextResponse.json({
        success: true,
        message: 'Questão homologada como limpa com sucesso!',
        action: 'approve_clean'
      });
    }

    // Se a ação for substituição cirúrgica de URL (Inpainting, Oficial da Banca ou Manual)
    if ((action === 'replace_image' || action === 'apply_inpainting' || action === 'apply_official') && oldUrl) {
      const { data: currentQ, error: fetchErr } = await supabaseAdmin
        .from('questions')
        .select('id, code, statement, commentary, options, images')
        .eq('id', questionId)
        .single();

      if (fetchErr || !currentQ) {
        throw new Error(`Questão não encontrada no Supabase: ${fetchErr?.message}`);
      }

      let finalTargetUrl = newUrl;

      // Se for inpainting e a URL fornecida for temporária ou inexistente, gera o WebP limpo permanente
      if (action === 'apply_inpainting') {
        try {
          const fetchTarget = (!oldUrl.includes('medevo.com.br')) ? oldUrl : (newUrl || oldUrl);
          const res = await fetch(fetchTarget);
          if (res.ok) {
            const rawBuf = Buffer.from(await res.arrayBuffer());
            const cleanBuf = await sanitizeMedicalWatermark(rawBuf, 'centro');

            const safeCode = (currentQ.code || questionId).replace(/[^a-zA-Z0-9_-]/g, '_');
            const storagePath = `sanitized/${safeCode}_inpainted_${Date.now()}.webp`;

            const { error: uploadErr } = await supabaseAdmin.storage
              .from('questoes')
              .upload(storagePath, cleanBuf, { contentType: 'image/webp', upsert: true });

            if (!uploadErr) {
              const { data: pUrl } = supabaseAdmin.storage.from('questoes').getPublicUrl(storagePath);
              if (pUrl?.publicUrl) finalTargetUrl = pUrl.publicUrl;
            }
          }
        } catch (inpaintErr) {
          console.error('Erro ao gerar inpainting permanente:', inpaintErr);
        }
      }

      // Se for adoção de imagem oficial local (/images/oficiais/...)
      if (action === 'apply_official' && newUrl && newUrl.startsWith('/images/oficiais/')) {
        try {
          const localRel = newUrl.startsWith('/') ? newUrl.slice(1) : newUrl;
          const localPath = path.join(process.cwd(), 'public', localRel);
          if (fs.existsSync(localPath)) {
            const fileBuf = fs.readFileSync(localPath);
            const safeCode = (currentQ.code || questionId).replace(/[^a-zA-Z0-9_-]/g, '_');
            const ext = path.extname(localPath).replace('.', '') || 'webp';
            const storagePath = `oficiais/${safeCode}_official_${Date.now()}.${ext}`;

            const { error: uploadErr } = await supabaseAdmin.storage
              .from('questoes')
              .upload(storagePath, fileBuf, { contentType: ext === 'png' ? 'image/png' : 'image/webp', upsert: true });

            if (!uploadErr) {
              const { data: pUrl } = supabaseAdmin.storage.from('questoes').getPublicUrl(storagePath);
              if (pUrl?.publicUrl) finalTargetUrl = pUrl.publicUrl;
            }
          }
        } catch (officialErr) {
          console.error('Erro ao migrar oficial local para Supabase:', officialErr);
        }
      }

      if (!finalTargetUrl) {
        throw new Error('URL de destino para substituição não pôde ser gerada.');
      }

      const updates: Record<string, unknown> = {};

      if (typeof currentQ.statement === 'string' && currentQ.statement.includes(oldUrl)) {
        updates.statement = currentQ.statement.replaceAll(oldUrl, finalTargetUrl);
      }

      if (typeof currentQ.commentary === 'string' && currentQ.commentary.includes(oldUrl)) {
        updates.commentary = currentQ.commentary.replaceAll(oldUrl, finalTargetUrl);
      }

      if (Array.isArray(currentQ.images)) {
        updates.images = currentQ.images.map((img: string) => img === oldUrl ? finalTargetUrl : img);
      }

      if (Array.isArray(currentQ.options)) {
        updates.options = currentQ.options.map((opt: { letter: string; text: string; justification?: string }) => {
          if (typeof opt.text === 'string' && opt.text.includes(oldUrl)) {
            return { ...opt, text: opt.text.replaceAll(oldUrl, finalTargetUrl) };
          }
          return opt;
        });
      }

      const { data: updatedQ, error: updateErr } = await supabaseAdmin
        .from('questions')
        .update(updates)
        .eq('id', questionId)
        .select('id, code, statement, commentary, options, images')
        .single();

      if (updateErr) {
        throw new Error(`Falha ao atualizar questão: ${updateErr.message}`);
      }

      // Sincroniza também no manifesto
      updateManifestQuestionClean(questionId, { oldUrl, newUrl });

      return NextResponse.json({
        success: true,
        message: 'Imagem atualizada com sucesso no Supabase!',
        action,
        updatedQuestion: updatedQ
      });
    }

    // Atualização genérica de campos (Texto, Enunciado, etc.)
    const updateData: Record<string, unknown> = {};

    if (statement !== undefined) updateData.statement = statement;
    if (commentary !== undefined) updateData.commentary = commentary;
    if (options !== undefined) updateData.options = options;
    if (images !== undefined) updateData.images = images;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhum campo fornecido para atualização.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('questions')
      .update(updateData)
      .eq('id', questionId)
      .select('id, code, statement, commentary, options, images')
      .single();

    if (error) {
      console.error('Erro ao atualizar questão no Supabase:', error);
      return NextResponse.json(
        { success: false, error: `Falha no Supabase: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Questão atualizada com sucesso no Supabase!',
      action,
      updatedQuestion: data
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro interno ao atualizar questão.';
    console.error('Erro no PATCH /api/admin/medevo:', err);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
