import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('document_id')?.trim();
    const attemptParam = searchParams.get('attempt_number');

    if (!documentId || documentId.startsWith('[')) {
      return NextResponse.json({ success: false, error: 'Invalid document_id' }, { status: 400 });
    }

    const query = supabase
      .from('student_question_ink')
      .select('document_id, attempt_number, strokes, updated_at')
      .eq('user_id', user.id)
      .eq('document_id', documentId);

    if (attemptParam !== null && !isNaN(Number(attemptParam))) {
      const { data, error } = await query
        .eq('attempt_number', Number(attemptParam))
        .maybeSingle();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        document_id: documentId,
        attempt_number: Number(attemptParam),
        strokes: data?.strokes ?? []
      });
    }

    // Retorna todos os registros da questão ordenados por tentativa
    const { data, error } = await query.order('attempt_number', { ascending: true });
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const attempts = data ?? [];
    const latestAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;

    return NextResponse.json({
      success: true,
      document_id: documentId,
      current_attempt: latestAttempt?.attempt_number ?? 1,
      available_attempts: attempts.map(a => a.attempt_number),
      strokes: latestAttempt?.strokes ?? []
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { document_id: rawDocId, attempt_number = 1, strokes } = body;
    const document_id = typeof rawDocId === 'string' ? rawDocId.trim() : '';

    if (!document_id || document_id.startsWith('[')) {
      return NextResponse.json({ success: false, error: 'Invalid document_id' }, { status: 400 });
    }

    if (!Array.isArray(strokes)) {
      return NextResponse.json({ success: false, error: 'strokes must be an array' }, { status: 400 });
    }

    // Limite de segurança anti-DoS de traços
    if (strokes.length > 800) {
      return NextResponse.json({ success: false, error: 'Exceeded maximum strokes limit (800)' }, { status: 413 });
    }

    const attemptNum = Number(attempt_number) || 1;

    const { error: upsertErr } = await supabase
      .from('student_question_ink')
      .upsert(
        {
          user_id: user.id,
          document_id,
          attempt_number: attemptNum,
          strokes,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id, document_id, attempt_number' }
      );

    if (upsertErr) {
      return NextResponse.json({ success: false, error: upsertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      document_id,
      attempt_number: attemptNum,
      count: strokes.length
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
