import assert from 'node:assert/strict';

async function query(body, headers = {}) {
  let response;
  try {
    response = await fetch('http://localhost:3000/api/questions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000)
    });
  } catch (err) {
    if (err?.code === 'ECONNREFUSED' || err?.cause?.code === 'ECONNREFUSED' || err?.message?.includes('fetch failed')) {
      console.warn('⚠️ Servidor local (localhost:3000) offline. Pulando teste de integração de rede.');
      process.exit(0);
    }
    throw err;
  }
  if (response.status === 503) {
    console.warn('⚠️ Banco Supabase remoto indisponível (503). Pulando teste de integração de rede.');
    process.exit(0);
  }
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
const expiredSession = { Authorization: 'Bearer expired-test-session' };
const result = await query({ action: 'facets', filters }, expiredSession);
assert.deepEqual(result.facets, facets);
const catalog = await query({ action: 'catalog', filters }, expiredSession);
assert(catalog.bancas.ENARE > 0);
console.log('Facetas, lista e recorte clínico têm as mesmas contagens.');
