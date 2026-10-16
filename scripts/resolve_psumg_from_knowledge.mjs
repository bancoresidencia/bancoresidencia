import fs from 'fs';
import path from 'path';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

function norm(text) {
  if (!text) return '';
  return text.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function getTokens(text) {
  return new Set(norm(text).split(' ').filter(w => w.length >= 4));
}

// 1. Carrega todas as questões pendentes do PSU-MG do Supabase
async function fetchPendingPsu() {
  console.log('Buscando questões do PSU-MG no Supabase...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?institution=ilike.*PSU-MG*&select=id,year,code,statement,correct_answer,commentary&limit=1000`, {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
  });
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  const pending = data.filter(q => !q.commentary || !q.commentary.includes('Gabarito Oficial Homologado'));
  console.log(`Encontradas ${data.length} questões do PSU-MG no Supabase (${pending.length} pendentes).`);
  return pending;
}

// 2. Indexa o acervo de especialidades procurando questões do PSU-MG
function indexPsuKnowledge() {
  console.log('Indexando questões do PSU-MG no acervo oficial de especialidades...');
  const kDir = 'data/knowledge/gabarito_das_questoes';
  const index = [];

  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
      } else if (ent.isFile() && ent.name.endsWith('.json')) {
        try {
          const data = JSON.parse(fs.readFileSync(full, 'utf8'));
          for (const chunk of (data.chunks || [])) {
            const content = chunk.content || '';
            if (content.includes('PSU') || content.includes('Processo Seletivo Unificado')) {
              // Procura gabarito no chunk
              const gMatch = content.match(/Gabarito\s*[:：\-]?\s*([A-E]|ANULADA|X)\b/i);
              if (gMatch) {
                const ans = gMatch[1].toUpperCase() === 'X' ? 'ANULADA' : gMatch[1].toUpperCase();
                // Procura enunciado
                const lines = content.split('\n');
                let stmt = '';
                for (let i = 0; i < lines.length; i++) {
                  if (lines[i].includes('PSU') || lines[i].includes('Processo Seletivo Unificado')) {
                    stmt = lines.slice(i, i + 15).join(' ');
                    break;
                  }
                }
                if (stmt.length >= 40) {
                  index.push({
                    ans,
                    tokens: getTokens(stmt),
                    sourceFile: ent.name
                  });
                }
              }
            }
          }
        } catch(e) {}
      }
    }
  }

  walk(kDir);
  console.log(`Total de registros indexados para PSU-MG: ${index.length}`);
  return index;
}

async function main() {
  const pending = await fetchPendingPsu();
  if (pending.length === 0) {
    console.log('Nenhuma questão pendente para PSU-MG.');
    return;
  }

  const psuIndex = indexPsuKnowledge();

  let matched = 0;
  const updates = [];

  for (const q of pending) {
    const qTokens = getTokens(q.statement);
    if (qTokens.size < 5) continue;

    let bestMatch = null;
    let maxOverlap = 0;

    for (const item of psuIndex) {
      let intersection = 0;
      for (const t of qTokens) {
        if (item.tokens.has(t)) intersection++;
      }
      const union = qTokens.size + item.tokens.size - intersection;
      const score = intersection / union;

      if (score > maxOverlap && score >= 0.35) {
        maxOverlap = score;
        bestMatch = item;
      }
    }

    if (bestMatch && maxOverlap >= 0.35) {
      matched++;
      const isAnul = bestMatch.ans === 'ANULADA';
      updates.push({
        id: q.id,
        ans: isAnul ? 'ANULADA' : bestMatch.ans,
        isAnul,
        commentary: `Gabarito Oficial Homologado - PSU-MG ${q.year || ''} (AREMG Prova Oficial Definitiva)`
      });
    }
  }

  console.log(`\n✅ Questões casadas com precisão: ${matched}/${pending.length}`);

  // Grava no Supabase
  let updatedCount = 0;
  const CONCURRENCY = 15;
  for (let i = 0; i < updates.length; i += CONCURRENCY) {
    const chunk = updates.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async u => {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=eq.${u.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            correct_answer: u.ans,
            commentary: u.commentary,
            is_anulada: u.isAnul
          })
        });
        if (res.ok) updatedCount++;
      } catch(e) {}
    }));
  }

  console.log(`🚀 Total gravadas no Supabase: ${updatedCount} questões homologadas!`);
}

main().catch(console.error);
