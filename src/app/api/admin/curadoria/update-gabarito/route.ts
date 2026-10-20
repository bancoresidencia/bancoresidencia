import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

const VALID_LETTERS = new Set(['A', 'B', 'C', 'D', 'E', 'ANULADA', '']);

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();
    const { questionId, correctAnswer, isAnulada, commentary } = body;

    if (!questionId || typeof questionId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'ID da questão inválido ou ausente.' },
        { status: 400 }
      );
    }

    const normAnswer = typeof correctAnswer === 'string' ? correctAnswer.trim().toUpperCase() : '';
    if (!VALID_LETTERS.has(normAnswer)) {
      return NextResponse.json(
        { success: false, error: `Alternativa inválida: "${correctAnswer}". Esperado A, B, C, D, E ou vazio.` },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, string | boolean> = {
      correct_answer: normAnswer
    };

    if (typeof isAnulada === 'boolean') {
      updatePayload.is_anulada = isAnulada;
      if (isAnulada && !normAnswer) {
        updatePayload.correct_answer = 'ANULADA';
      }
    } else if (normAnswer === 'ANULADA') {
      updatePayload.is_anulada = true;
    }

    if (typeof commentary === 'string') {
      updatePayload.commentary = commentary.slice(0, 15000);
    }

    // Gravação direta com service role (bypassa RLS de forma segura)
    const { data, error } = await supabaseAdmin
      .from('questions')
      .update(updatePayload)
      .eq('id', questionId)
      .select('id, code, correct_answer, is_anulada');

    if (error) {
      console.error('[API Curadoria] Erro no Supabase update:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Questão não encontrada no Supabase.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Gabarito salvo com sucesso no banco de dados.',
      updated: data[0]
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno do servidor';
    console.error('[API Curadoria] Exceção:', err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
