import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const t = l.trim(); if (!t || t.startsWith('#')) return;
  const [k, ...v] = t.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY);

const hex = '0123456789abcdef'.split('');
const nonOuro = [];

await Promise.all(hex.map(async (h) => {
  const lower = `${h}0000000-0000-0000-0000-000000000000`;
  const upper = `${h}fffffff-ffff-ffff-ffff-ffffffffffff`;
  let lastId = null;

  while (true) {
    let q = supabase
      .from('questions_direto')
      .select('id, code, commentary, options')
      .gte('id', lastId ? lastId : lower)
      .lte('id', upper)
      .not('commentary', 'is', null)
      .neq('commentary', '')
      .not('commentary', 'ilike', '%Take-Home%')
      .order('id', { ascending: true })
      .limit(1000);
    if (lastId) q = q.gt('id', lastId);

    const { data, error } = await q;
    if (error || !data || data.length === 0) break;
    lastId = data[data.length - 1].id;

    for (const r of data) {
      const c = (r.commentary || '').trim();
      if (c && !c.includes('Take-Home')) {
        nonOuro.push(r);
      }
    }
    if (data.length < 1000) break;
  }
}));

// Check pdr_% too
let pdrLast = null;
while (true) {
  let q = supabase.from('questions_direto').select('id, code, commentary, options').like('id', 'pdr_%').order('id', { ascending: true }).limit(1000);
  if (pdrLast) q = q.gt('id', pdrLast);
  const { data } = await q;
  if (!data || !data.length) break;
  pdrLast = data[data.length - 1].id;
  for (const r of data) {
    const c = (r.commentary || '').trim();
    if (c && !c.includes('Take-Home')) nonOuro.push(r);
  }
  if (data.length < 1000) break;
}

let takeHomeNoHyphen = 0, sinteseOuPerola = 0, optionsBoldSemHtml = 0;
let jsonBruto = 0, placeholders = 0, legadoTerceirosOuCurto = 0;
const suspectOuroSamples = [];

for (const r of nonOuro) {
  const c = (r.commentary || '').trim();
  const cLow = c.toLowerCase();
  const opts = Array.isArray(r.options) ? r.options : [];
  const hasCleanBoldExp = opts.some(o => o.explanation && o.explanation.includes('**') && !o.explanation.includes('<u>'));

  if (cLow.includes('take home') || cLow.includes('takehome')) {
    takeHomeNoHyphen++;
    suspectOuroSamples.push({ code: r.code, reason: 'take home', prev: c.slice(0, 100) });
  } else if (c.includes('Síntese Clínica') || c.includes('Armadilha da Questão') || c.includes('Pérola Clínica') || c.includes('💡')) {
    sinteseOuPerola++;
    suspectOuroSamples.push({ code: r.code, reason: 'sintese/perola/💡', prev: c.slice(0, 100) });
  } else if (hasCleanBoldExp) {
    optionsBoldSemHtml++;
    if (suspectOuroSamples.length < 10) suspectOuroSamples.push({ code: r.code, reason: 'opt **bold** exp', prev: c.slice(0, 100) });
  } else if (c.startsWith('{') && (c.includes('"_id"') || c.includes('"statementComment"'))) {
    jsonBruto++;
  } else if (c.includes('Gabarito Oficial Homologado') || c.startsWith('Gabarito Oficial') || cLow.includes('gabarito não disponibilizado')) {
    placeholders++;
  } else {
    legadoTerceirosOuCurto++;
  }
}

console.log('=== AUDITORIA SEGURANÇA TOTAL EM questions_direto (SEM Take-Home) ===');
console.log({
  totalComAlgumTextoSemTakeHome: nonOuro.length,
  suspeito_takeHomeNoHyphen: takeHomeNoHyphen,
  suspeito_sinteseOuPerola: sinteseOuPerola,
  suspeito_optionsBoldSemHtml: optionsBoldSemHtml,
  confirmado_jsonBruto: jsonBruto,
  confirmado_placeholders: placeholders,
  confirmado_legadoTerceirosOuCurto: legadoTerceirosOuCurto
});
if (suspectOuroSamples.length) console.table(suspectOuroSamples);
