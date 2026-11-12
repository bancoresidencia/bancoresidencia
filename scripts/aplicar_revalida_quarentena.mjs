import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY;

const rawTree = JSON.parse(fs.readFileSync('data/catalogo_arvore_canonica_completa.json', 'utf8'));
const canonicalFocoMap = new Map();
for (const espNode of (rawTree.hierarquia_padrao || [])) {
  const espName = espNode.especialidade;
  for (const t of (espNode.temas || [])) {
    for (const f of (t.focos || [])) {
      const focoName = f.foco;
      const subfocosList = (f.subfocos || []).map(s => typeof s === 'string' ? s : s.subfoco).filter(Boolean);
      canonicalFocoMap.set(focoName.toLowerCase().trim(), { especialidade: espName, tema: t.tema, foco: focoName, subfocosList });
    }
  }
}

const qRev = JSON.parse(fs.readFileSync('data/quarentena_questions_expansion_revalida.json', 'utf8'));
const qRevMap = new Map();
qRev.forEach(item => qRevMap.set(item.id, item));

console.log('🔄 Buscando 727 questões de Revalida com subfoco=Geral...');
const res = await fetch(`${SUPABASE_URL}/rest/v1/questions_expansion_revalida?subfoco=eq.Geral&select=id&limit=1000`, {
  headers: { 'apikey': SERVICE_KEY, 'Authorization': 'Bearer ' + SERVICE_KEY }
});
const rows = await res.json();
console.log(`Encontradas ${rows.length} questões para atualizar.`);

let updatedCount = 0;
for (const r of rows) {
  const q = qRevMap.get(r.id);
  if (!q) continue;

  const entry = canonicalFocoMap.get((q.foco_sugerido || '').toLowerCase().trim());
  if (!entry) continue;

  const sSug = (q.subfoco_sugerido || '').trim();
  const matchedSub = entry.subfocosList.find(s => s.toLowerCase().trim() === sSug.toLowerCase().trim()) ||
                     entry.subfocosList.find(s => s.toLowerCase().includes(sSug.toLowerCase()) || sSug.toLowerCase().includes(s.toLowerCase())) ||
                     entry.subfocosList[0];

  const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/questions_expansion_revalida?id=eq.${r.id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      especialidade: entry.especialidade,
      tema: entry.tema,
      foco: entry.foco,
      subfoco: matchedSub
    })
  });

  if (patchRes.ok) {
    updatedCount++;
    if (updatedCount % 100 === 0 || updatedCount === rows.length) {
      console.log(`  ✅ Atualizadas ${updatedCount} / ${rows.length} questões de Revalida...`);
    }
  }
}

console.log(`🎉 Sucesso! Todas as ${updatedCount} questões de Revalida foram canonicamente resolvidas no Supabase!`);
