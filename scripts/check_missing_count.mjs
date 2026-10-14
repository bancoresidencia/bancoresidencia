import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const bancas = ['INEP Revalida', 'ENARE/ENAMED', 'UFMT Revalida', 'UEPA Revalida', 'UNIRG Revalida'];
  let all = [];
  const seen = new Set();

  for (const b of bancas) {
    let offset = 0;
    while (true) {
      const { data, error } = await supabase
        .from('questions')
        .select('id, statement, banca, year, correct_answer, is_anulada, options')
        .eq('banca', b)
        .range(offset, offset + 999);
      if (error || !data || data.length === 0) break;
      for (const item of data) {
        if (!seen.has(item.id)) {
          all.push(item);
          seen.add(item.id);
        }
      }
      offset += data.length;
      if (data.length < 1000) break;
    }
  }

  // Also check codes
  for (const pref of ['INEPREVALIDA', 'ENAREENAMED']) {
    let offset = 0;
    while (true) {
      const { data, error } = await supabase
        .from('questions')
        .select('id, statement, banca, year, correct_answer, is_anulada, options')
        .ilike('code', pref + '%')
        .range(offset, offset + 999);
      if (error || !data || data.length === 0) break;
      for (const item of data) {
        if (!seen.has(item.id)) {
          all.push(item);
          seen.add(item.id);
        }
      }
      offset += data.length;
      if (data.length < 1000) break;
    }
  }

  const inep = all.filter(q => (q.banca || '').includes('Revalida') || (q.banca || '').includes('INEP'));
  const enare = all.filter(q => (q.banca || '').includes('ENARE') || (q.banca || '').includes('ENAMED'));

  function audit(list, name) {
    let semGabarito = 0;
    let comGabarito = 0;
    let anuladas = 0;
    let discursivas = 0;
    const porAno = {};

    for (const q of list) {
      let opts = [];
      try {
        opts = Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options || '[]') : []);
      } catch (e) {
        opts = [];
      }
      const isDiscursiva = opts.length === 0;
      const ans = (q.correct_answer || '').trim().toUpperCase();
      const isAnulada = q.is_anulada === true || ['ANULADA', 'X', '*'].includes(ans);
      const hasAns = ['A', 'B', 'C', 'D', 'E'].includes(ans);

      if (isDiscursiva) {
        discursivas++;
      } else if (isAnulada) {
        anuladas++;
      } else if (hasAns) {
        comGabarito++;
      } else {
        semGabarito++;
        porAno[q.year] = (porAno[q.year] || 0) + 1;
      }
    }
    console.log(`\n=== ${name} ===`);
    console.log(`Total no Banco: ${list.length}`);
    console.log(`Com Gabarito Oficial (A-E): ${comGabarito}`);
    console.log(`Anuladas Oficiais: ${anuladas}`);
    console.log(`Discursivas (Sem A-E): ${discursivas}`);
    console.log(`FALTANDO GABARITO (Objetivas): ${semGabarito}`);
    console.log(`Faltando por Ano:`, JSON.stringify(porAno, null, 2));
  }

  audit(inep, 'INEP REVALIDA (E OUTRAS)');
  audit(enare, 'ENARE / ENAMED');
  audit(all, 'TOTAL GERAL REVALIDA + ENARE');
}

run();
