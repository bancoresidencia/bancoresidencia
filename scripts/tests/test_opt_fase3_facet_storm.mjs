import assert from 'node:assert/strict';

async function query(body) {
  const response = await fetch('http://localhost:3000/api/questions', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000)
  });
  assert.equal(response.status, 200);
  return response.json();
}

const filters = { modalidades: ['Acesso Direto'], anos: [2026] };
const { facets } = await query({ action: 'facets', filters });
const list = await query({ filters, pageSize: 1 });
assert(facets.totalRightCardCount > 0);
assert.equal(facets.totalRightCardCount, list.total);
const specialty = 'Pediatria';
const narrowed = await query({ filters: { ...filters, clinicalPaths: [[specialty]] }, pageSize: 1 });
assert.equal(facets.paths[specialty], narrowed.total);
console.log('Facetas, lista e recorte clínico têm as mesmas contagens.');
