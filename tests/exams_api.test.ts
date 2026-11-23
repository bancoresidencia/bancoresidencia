import { describe, it } from 'node:test';
import assert from 'node:assert';
import { NextRequest } from 'next/server';
import { GET as getExams } from '@/app/api/exams/route';
import { GET as getExamById } from '@/app/api/exams/[id]/route';

describe('Official Exams API Routes (/api/exams)', () => {
  it('should return paginated certified exams list', async () => {
    const req = new NextRequest('http://localhost:3000/api/exams?limit=5');
    const res = await getExams(req);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.exams.length, 5);
    assert.strictEqual(data.total, 2093);
    assert.strictEqual(data.totalPages, Math.ceil(2093 / 5));
  });

  it('should filter exams by institution alias correctly', async () => {
    const req = new NextRequest('http://localhost:3000/api/exams?instituicao=UNICAMP');
    const res = await getExams(req);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.exams.length > 0);
    assert.ok(data.exams.every((e: { institution_slug: string }) => e.institution_slug === 'hc-unicamp'));
  });

  it('should return catalog statistics with action=stats', async () => {
    const req = new NextRequest('http://localhost:3000/api/exams?action=stats');
    const res = await getExams(req);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.stats.total_exams, 2093);
    assert.ok(data.stats.total_questions > 160000);
  });

  it('should return full exam details including question_ids for valid id/slug', async () => {
    const listReq = new NextRequest('http://localhost:3000/api/exams?instituicao=HCFMUSP&limit=1');
    const listRes = await getExams(listReq);
    const listData = await listRes.json();
    const sampleSlug = listData.exams[0].slug;

    const req = new NextRequest(`http://localhost:3000/api/exams/${sampleSlug}`);
    const res = await getExamById(req, { params: Promise.resolve({ id: sampleSlug }) });
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.exam.slug, sampleSlug);
    assert.ok(Array.isArray(data.exam.question_ids));
    assert.strictEqual(data.exam.question_ids.length, data.exam.total_questions);
    assert.ok(data.exam.duration_minutes >= 120);
  });

  it('should return 404 for non-existent exam id', async () => {
    const req = new NextRequest('http://localhost:3000/api/exams/inexistente-1234');
    const res = await getExamById(req, { params: Promise.resolve({ id: 'inexistente-1234' }) });
    assert.strictEqual(res.status, 404);
  });
});
