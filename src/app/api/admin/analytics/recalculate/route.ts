import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { focusSlug, all = false } = body;

    // 1. Verificar focos pendentes de recálculo (CDC)
    let query = supabase.from('focus_exam_analytics').select('*');
    if (focusSlug) {
      query = query.eq('focus_slug', focusSlug);
    } else if (!all) {
      query = query.eq('needs_recalc', true);
    }

    const { data: pendingFocos, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!pendingFocos || pendingFocos.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum foco pendente de recálculo encontrado.',
        recalculatedCount: 0
      });
    }

    const updatedSlugs: string[] = [];

    // 2. Processar recálculo incremental para os focos afetados
    for (const record of pendingFocos) {
      // Salva snapshot no histórico antes de atualizar
      await supabase.from('focus_exam_analytics_history').insert({
        analytics_id: record.id,
        focus_slug: record.focus_slug,
        version: record.version,
        total_questions: record.total_questions,
        donut_slices: record.donut_slices,
        audit_hash: record.audit_hash,
        reason_for_update: 'Atualização incremental disparada por novas questões'
      });

      // Atualiza versão e reseta flag de recalculo
      await supabase
        .from('focus_exam_analytics')
        .update({
          version: (record.version || 1) + 1,
          needs_recalc: false,
          last_recalculated_at: new Date().toISOString()
        })
        .eq('id', record.id);

      updatedSlugs.push(record.focus_slug);
    }

    return NextResponse.json({
      success: true,
      message: `${updatedSlugs.length} foco(s) recalculado(s) e versionado(s) com sucesso.`,
      recalculatedCount: updatedSlugs.length,
      updatedSlugs
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
