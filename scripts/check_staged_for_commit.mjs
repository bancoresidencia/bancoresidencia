import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectConsolidated() {
  const map = new Map();

  // 1. staging_homologados_85pct.json
  const p85 = 'data/staging_homologados_85pct.json';
  if (fs.existsSync(p85)) {
    const d = JSON.parse(fs.readFileSync(p85, 'utf8').replace(/^\uFEFF/, ''));
    (d.decisoes || []).forEach(x => {
      const key = x.id || x.code;
      map.set(key, {
        id: x.id,
        code: x.code,
        ano: x.ano,
        gabarito: x.gabaritoMapeadoNoBanco || x.gabaritoOficialExtraido || (x.isAnulada ? 'ANULADA' : null),
        origem: x.caderno || 'staging_homologados_85pct',
        isAnulada: x.isAnulada || false
      });
    });
  }

  // 2. staging_lote_1 a 10
  for (let i = 1; i <= 10; i++) {
    const p = `data/staging_lote_${i}.json`;
    if (fs.existsSync(p)) {
      const d = JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
      (d.decisoes || []).forEach(x => {
        const key = x.id || x.code;
        if (!map.has(key)) {
          map.set(key, {
            id: x.id,
            code: x.code,
            ano: x.year || x.ano,
            gabarito: x.mappedLetter || x.gabaritoMapeadoNoBanco || x.gabaritoOficialExtraido || (x.isAnulada ? 'ANULADA' : null),
            origem: `Lote ${i} (${x.provider || 'Web QAPage'})`,
            isAnulada: x.isAnulada || false
          });
        }
      });
    }
  }

  console.log(`Total consolidado único para aplicação: ${map.size}`);
  
  // Amostra e validação
  const invalid = [];
  const byAns = {};
  for (const [k, v] of map.entries()) {
    if (!v.gabarito) invalid.push(v);
    else byAns[v.gabarito] = (byAns[v.gabarito] || 0) + 1;
  }

  console.log('Distribuição dos gabaritos a serem gravados:', byAns);
  if (invalid.length > 0) {
    console.error('ALERTA: Itens sem gabarito válido:', invalid.length);
  } else {
    console.log('✅ 100% dos itens possuem gabarito válido e pronto!');
  }
}

inspectConsolidated().catch(console.error);
