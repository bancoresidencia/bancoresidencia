import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';
import fs from 'fs';
import path from 'path';

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

interface ManifestQuestion {
  id: string;
  code: string;
  banca: string;
  year: number;
  hasTextHit: boolean;
  textHits: Array<{ field: string; match: string; snippet: string }>;
  hasImageHit: boolean;
  images: Array<{ url: string; field: string }>;
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

function getManifest(): ManifestQuestion[] {
  if (cachedManifest) return cachedManifest;
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
    const filter = searchParams.get('filter') || 'all'; // all, text, image, both, clean, pending
    const banca = searchParams.get('banca') || 'all';
    const search = (searchParams.get('search') || '').trim().toLowerCase();

    const manifest = getManifest();

    // 1. Filtragem preliminar do manifesto
    const filtered = manifest.filter(q => {
      // Filtro de Categoria
      if (filter === 'text' && !q.hasTextHit) return false;
      if (filter === 'image' && !q.hasImageHit) return false;
      if (filter === 'both' && (!q.hasTextHit || !q.hasImageHit)) return false;

      // Filtro de Banca
      if (banca !== 'all' && q.banca !== banca) return false;

      // Busca por texto
      if (search) {
        const matchesCode = (q.code || '').toLowerCase().includes(search);
        const matchesBanca = (q.banca || '').toLowerCase().includes(search);
        const matchesId = q.id.toLowerCase().includes(search);
        const matchesSnippet = q.textHits?.some(th => th.snippet.toLowerCase().includes(search));
        if (!matchesCode && !matchesBanca && !matchesId && !matchesSnippet) return false;
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

      const isClean = !hasTextInDb && !hasMedevoImagesInDb;

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
        manifestHits: manifestItem.textHits,
        manifestImages: manifestItem.images,
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
    const { questionId, statement, commentary, options, images, action } = body;

    if (!questionId || typeof questionId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'ID da questão ausente ou inválido.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
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
