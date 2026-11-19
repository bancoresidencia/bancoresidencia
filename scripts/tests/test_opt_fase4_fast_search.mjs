import assert from 'node:assert/strict';

async function query(body) {
  const response = await fetch('http://localhost:3000/api/questions', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000)
  });
  assert.equal(response.status, 200);
  return response.json();
}

const filters = { modalidades: ['Residência Médica'], anos: [2026] };
const [first, second, zero] = await Promise.all([
  query({ page: 1, pageSize: 50, filters }),
  query({ page: 2, pageSize: 50, filters }),
  query({ page: 1, filters, questionIds: [] })
]);
assert.equal(first.questions.length, 50);
assert.equal(second.questions.length, 50);
assert.equal(first.total, second.total);
assert.equal(new Set([...first.questions, ...second.questions].map((question) => question.id)).size, 100);
assert.equal(zero.total, 0);
assert.deepEqual(zero.questions, []);
console.log('Paginação sem sobreposição e resultado vazio mantêm a contagem exata.');
