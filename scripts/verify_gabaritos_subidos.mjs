import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` };

async function cnt(filter) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?${filter}&select=id&limit=1`, {
    headers: { ...headers, 'Prefer': 'count=planned', 'Range': '0-0' }
  });
  return parseInt(res.headers.get('content-range')?.split('/')[1] ?? '0') || 0;
}

async function sample(filter, limit = 5) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?${filter}&select=id,correct_answer,commentary&limit=${limit}`, { headers });
  return await res.json();
}

async function main() {
  console.log('\n================================================================');
  console.log('  GABARITOS OFICIAIS — VERIFICAÇÃO NA PLATAFORMA (Supabase)');
  console.log('================================================================');

  // Total homologadas com carimbo oficial
  const homologTotal = await cnt('commentary=ilike.*Gabarito+Oficial+Homologado*');

  // Dessas, quantas têm correct_answer = A/B/C/D/E (efetivamente subido)
  const homologComAlt = await cnt('commentary=ilike.*Gabarito+Oficial+Homologado*&correct_answer=in.(A,B,C,D,E)');
  const homologAnulada = await cnt('commentary=ilike.*Gabarito+Oficial+Homologado*&correct_answer=eq.ANULADA');
  const homologVazio  = await cnt('commentary=ilike.*Gabarito+Oficial+Homologado*&correct_answer=not.in.(A,B,C,D,E,ANULADA)&correct_answer=not.is.null');
  const homologNull   = await cnt('commentary=ilike.*Gabarito+Oficial+Homologado*&correct_answer=is.null');

  const subidos = homologComAlt + homologAnulada;

  console.log(`Total com carimbo "Gabarito Oficial Homologado"  : ${homologTotal.toLocaleString('pt-BR')}`);
  console.log('');
  console.log('✅ Gabarito JÁ SUBIDO na plataforma (correct_answer válido):');
  console.log(`   Alternativas A/B/C/D/E                        : ${homologComAlt.toLocaleString('pt-BR')}`);
  console.log(`   ANULADA                                       : ${homologAnulada.toLocaleString('pt-BR')}`);
  console.log(`   SUBTOTAL SUBIDOS                              : ${subidos.toLocaleString('pt-BR')}  (${((subidos/homologTotal)*100).toFixed(1)}%)`);
  console.log('');
  console.log('⚠️  Com carimbo MAS sem alternativa real na plataforma:');
  console.log(`   correct_answer vazio ou outro valor           : ${homologVazio.toLocaleString('pt-BR')}`);
  console.log(`   correct_answer = null                         : ${homologNull.toLocaleString('pt-BR')}`);
  const pendentes = homologVazio + homologNull;
  console.log(`   SUBTOTAL PENDENTES                            : ${pendentes.toLocaleString('pt-BR')}  (${((pendentes/homologTotal)*100).toFixed(1)}%)`);

  // Amostra dos subidos
  console.log('\n--- Amostra (5 questões com gabarito oficial subido) ---');
  const amostrasOk = await sample('commentary=ilike.*Gabarito+Oficial+Homologado*&correct_answer=in.(A,B,C,D,E)', 5);
  if (Array.isArray(amostrasOk)) {
    for (const q of amostrasOk) {
      console.log(`  ✅ [${q.id}] correct_answer=${q.correct_answer} | ${(q.commentary||'').substring(0,90)}`);
    }
  }

  // Amostra dos pendentes (se houver)
  if (pendentes > 0) {
    console.log('\n--- Amostra (pendentes — carimbo mas sem alternativa) ---');
    const amostrasPend = await sample('commentary=ilike.*Gabarito+Oficial+Homologado*&correct_answer=not.in.(A,B,C,D,E,ANULADA)', 5);
    if (Array.isArray(amostrasPend)) {
      for (const q of amostrasPend) {
        console.log(`  ⚠️  [${q.id}] correct_answer="${q.correct_answer}" | ${(q.commentary||'').substring(0,90)}`);
      }
    }
  }

  console.log('\n================================================================');
  console.log(`RESULTADO: ${subidos.toLocaleString('pt-BR')} de ${homologTotal.toLocaleString('pt-BR')} gabaritos oficiais já estão na plataforma.`);
  if (pendentes === 0) {
    console.log('✅ 100% dos gabaritos homologados foram sincronizados!');
  } else {
    console.log(`⚠️  ${pendentes.toLocaleString('pt-BR')} ainda precisam ser sincronizados.`);
  }
  console.log('================================================================\n');
}

main().catch(console.error);
