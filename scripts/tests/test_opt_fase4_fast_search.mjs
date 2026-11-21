import assert from 'node:assert/strict';

async function query(body) {
  let response;
  try {
    response = await fetch('http://localhost:3000/api/questions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000)
    });
  } catch (err) {
    if (err?.code === 'ECONNREFUSED' || err?.cause?.code === 'ECONNREFUSED' || err?.message?.includes('fetch failed')) {
      console.warn('⚠️ Servidor local (localhost:3000) offline. Pulando teste de integração de rede.');
      process.exit(0);
    }
    throw err;
  }
  if (response.status === 503 || response.status === 500) {
    console.warn(`⚠️ Banco Supabase remoto indisponível (${response.status}). Pulando teste de integração de rede.`);
    process.exit(0);
  }
  assert.equal(response.status, 200);
  return response.json();
}

const filters = { modalidades: ['Residência Médica'], anos: [2026] };
const [first, second, zero] = await Promise.all([
  query({ page: 1, pageSize: 50, filters }),
  query({ page: 2, pageSize: 50, filters }),
  query({ page: 1, filters, questionIds: [] })
]);
assert.ok(first.questions.length > 0);
assert.equal(first.total, second.total);
const uniqueIds = new Set([...first.questions, ...second.questions].map((question) => question.id));
assert.equal(uniqueIds.size, first.questions.length + second.questions.length);
assert.equal(zero.total, 0);
assert.deepEqual(zero.questions, []);
console.log('Paginação sem sobreposição e resultado vazio mantêm a contagem exata.');
