import { describe, it } from 'node:test';
import assert from 'node:assert';
import { NextRequest } from 'next/server';
import { GET as getExams } from '@/app/api/exams/route';
import { GET as getExamById } from '@/app/api/exams/[id]/route';
import { getCertifiedExams, getCertifiedExamById, getCertifiedExamsStats } from '@/services/certifiedExamsService';
import { resolveInstitution, getSupabaseInstitutionName, getAllCanonicalInstitutions } from '@/utils/institutionResolver';
import catalogData from '@/data/certifiedExamsSummary.json';
import officialData from '@/data/officialExamsData.json';

describe('Quality Gate: Provas Oficiais 100% Integrais (Etapa 6)', () => {
  it('1. Valida integridade estrutural do catálogo mestre de 2.093 cadernos certificados', () => {
    const rawCatalog = catalogData as {
      stats: { total_exams: number; total_questions: number; by_modality: Record<string, number> };
      exams: Array<{
        id: string;
        slug: string;
        title: string;
        institution_slug: string;
        total_questions: number;
        duration_minutes: number;
        question_ids: string[];
        is_certified: boolean;
      }>;
    };

    assert.strictEqual(rawCatalog.stats.total_exams, 2093, 'Total nominal de provas deve ser exatamente 2.093');
    assert.ok(rawCatalog.stats.total_questions > 160000, 'Total de questões deve exceder 160.000');
    assert.strictEqual(rawCatalog.exams.length, 2093, 'Array exams deve conter exatamente 2.093 elementos');

    // Validação estrita de cada caderno
    for (const exam of rawCatalog.exams) {
      assert.ok(exam.id && exam.slug, `Caderno ${exam.title} deve possuir id e slug válidos`);
      assert.ok(exam.institution_slug, `Caderno ${exam.slug} deve possuir institution_slug`);
      assert.ok(exam.total_questions > 0, `Caderno ${exam.slug} deve ter total_questions > 0`);
      assert.ok(exam.duration_minutes >= 120, `Caderno ${exam.slug} deve ter duration_minutes >= 120`);
      assert.strictEqual(exam.is_certified, true, `Caderno ${exam.slug} deve estar marcado como is_certified: true`);
    }

    // Amostragem profunda de question_ids via getCertifiedExamById
    const sampleIds = [rawCatalog.exams[0].id, rawCatalog.exams[100].id, rawCatalog.exams[500].id, rawCatalog.exams[1000].id];
    for (const sid of sampleIds) {
      const fullExam = getCertifiedExamById(sid);
      assert.ok(fullExam, `Exame amostrado ${sid} deve existir`);
      assert.strictEqual(
        fullExam.question_ids.length,
        fullExam.total_questions,
        `Exame ${sid} deve ter question_ids exatamente igual a total_questions (${fullExam.question_ids.length} vs ${fullExam.total_questions})`
      );
    }
  });

  it('2. Valida sincronização entre certifiedExamsCatalog.json e officialExamsData.json', () => {
    const offData = officialData as {
      stats: { totalInstitutions: number; totalExams: number; totalQuestions: number };
      exams: Array<{ id: string; locationId: string; questionCount: number }>;
      institutions: Array<{ id: string; shortName: string; examCount: number }>;
    };

    assert.strictEqual(offData.stats.totalExams, 2093, 'officialExamsData deve registrar 2.093 exames');
    assert.strictEqual(offData.exams.length, 2093, 'Array exams em officialExamsData deve ter 2.093 cadernos');
    assert.ok(offData.stats.totalInstitutions >= 291, 'Deve haver ao menos 291 instituições catalogadas');

    const locationIds = new Set(offData.institutions.map((i) => i.id));
    for (const exam of offData.exams) {
      assert.ok(locationIds.has(exam.locationId), `Caderno ${exam.id} deve apontar para locationId existente`);
      assert.ok(exam.questionCount > 0, `Caderno ${exam.id} deve ter questionCount > 0`);
    }
  });

  it('3. Valida motor de resolução institucional em 100% das 291 instituições canônicas', () => {
    const allInstitutions = getAllCanonicalInstitutions();
    assert.strictEqual(allInstitutions.length, 291, 'Devem existir 291 instituições canônicas registradas');

    for (const inst of allInstitutions) {
      const sbName = getSupabaseInstitutionName(inst.slug);
      assert.ok(sbName && sbName.length > 0, `Instituição ${inst.slug} deve resolver nome Supabase não-vazio`);

      const resolved = resolveInstitution(inst.slug);
      assert.ok(resolved, `resolveInstitution deve localizar ${inst.slug}`);
      assert.strictEqual(resolved?.slug, inst.slug, `Slug resolvido deve coincidir com o canônico`);
    }
  });

  it('4. Valida endpoints de API de alto desempenho (/api/exams e /api/exams/[id])', async () => {
    // 4.1 Stats
    const statsReq = new NextRequest('http://localhost:3000/api/exams?action=stats');
    const statsRes = await getExams(statsReq);
    const statsData = await statsRes.json();
    assert.strictEqual(statsRes.status, 200);
    assert.strictEqual(statsData.stats.total_exams, 2093);

    // 4.2 Listagem paginada com filtro
    const filterReq = new NextRequest('http://localhost:3000/api/exams?instituicao=ENARE&limit=10');
    const filterRes = await getExams(filterReq);
    const filterData = await filterRes.json();
    assert.strictEqual(filterRes.status, 200);
    assert.ok(filterData.exams.length > 0);
    assert.ok(filterData.exams.every((e: { institution_slug: string }) => e.institution_slug === 'enare-enamed'));

    // 4.3 Caderno individual
    const targetSlug = filterData.exams[0].slug;
    const detailReq = new NextRequest(`http://localhost:3000/api/exams/${targetSlug}`);
    const detailRes = await getExamById(detailReq, { params: Promise.resolve({ id: targetSlug }) });
    const detailData = await detailRes.json();
    assert.strictEqual(detailRes.status, 200);
    assert.strictEqual(detailData.exam.slug, targetSlug);
    assert.ok(Array.isArray(detailData.exam.question_ids));
    assert.strictEqual(detailData.exam.question_ids.length, detailData.exam.total_questions);

    // 4.4 404 para slug inexistente
    const notFoundReq = new NextRequest('http://localhost:3000/api/exams/prova-inexistente-xyz');
    const notFoundRes = await getExamById(notFoundReq, { params: Promise.resolve({ id: 'prova-inexistente-xyz' }) });
    assert.strictEqual(notFoundRes.status, 404);
  });

  it('5. Valida distribuição por modalidade dos cadernos certificados', () => {
    const stats = getCertifiedExamsStats();
    assert.strictEqual(stats.by_modality.acesso_direto, 1886, 'Acesso Direto deve conter 1.886 cadernos');
    assert.strictEqual(stats.by_modality.r_plus, 204, 'R+ deve conter 204 cadernos');
    assert.strictEqual(stats.by_modality.revalida, 3, 'Revalida deve conter 3 cadernos');
  });
});
