import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ezluharxlmlqhdkqrjbz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const optionERestorations = {
  'CERMAM-2022-CLM-10228': 'Beribéri.',
  'FHSTE-2021-CLM-10236': 'Todas acima são verdadeiras.',
  'AUSTA-2019-CLM-26520': 'Doença pleural.',
  'PMF-2021-CLM-27112': 'O tratamento inicial deve ser com administração de betabloqueadores por via endovenosa, visando diminuir a frequência cardíaca e a pressão arterial.',
  'UFRGSHCPA-2022-OBS-4942': 'Acetazolamida, amilorida, furosemida e clortalidona.',
  'AFYAUNIVERSI-2017-OBS-6730': 'A imunização contra HPV faz parte do Calendário Nacional de Vacinação.',
  'USPHCRP-2018-PED-11809': 'Deve ser colocado em berço com colchão firme, sem cobertas, brinquedos, travesseiros ou qualquer outro tipo de objeto e em decúbito dorsal.',
  'UFRGSHCPA-2024-PED-19160': 'Ptiríase rósea.'
};

const hfaCertoErradoCodes = [
  'HFA-2020-CIR-1539',
  'HFA-2020-CIR-3467',
  'HFA-2020-CIR-7485',
  'HFA-2020-CIR-7703',
  'HFA-2020-CIR-8486',
  'HFA-2020-CIR-10142',
  'HFA-2020-CIR-11754'
];

const annulCodes = [
  'UNIVERSIDADE-2021-CIR-2418',
  'HOSPITALUNIM-2023-MPS-0092',
  'UNIVERSIDADE-2020-MPS-0133',
  'CENTROUNIVER-2022-MPS-1365',
  'SANTACASADEL-2019-MPS-4837',
  'SISESUS-2021-MPS-6019',
  'CERMAM-2021-MPS-13990',
  'UFMTREVALIDA-2019-MPS-21862'
];

const files = [
  'cirurgia_final_questions.json',
  'clinica_medica_final_questions.json',
  'medicina_preventiva_final_questions.json',
  'obstetricia_final_questions.json',
  'pediatria_final_questions.json'
];

const updatesToPush = [];

for (const file of files) {
  const filePath = 'data/' + file;
  const list = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let changed = false;

  for (const q of list) {
    if (hfaCertoErradoCodes.includes(q.code)) {
      q.correct_answer = 'A';
      q.is_anulada = false;
      q.commentary = 'Gabarito Oficial Definitivo: Alternativa A (Item CERTO).';
      changed = true;
      updatesToPush.push({
        id: q.id,
        correct_answer: 'A',
        is_anulada: false,
        commentary: q.commentary
      });
    } else if (optionERestorations[q.code]) {
      const eText = optionERestorations[q.code];
      if (Array.isArray(q.options)) {
        if (!q.options.find(o => o.letter === 'E')) {
          q.options.push({ letter: 'E', text: eText });
        }
      } else if (q.options) {
        q.options['E'] = eText;
      }
      q.correct_answer = 'E';
      q.is_anulada = false;
      changed = true;
      updatesToPush.push({
        id: q.id,
        correct_answer: 'E',
        options: q.options,
        is_anulada: false
      });
    } else if (annulCodes.includes(q.code)) {
      q.correct_answer = null;
      q.is_anulada = true;
      q.commentary = 'Questão com 4 alternativas (A-D) e gabarito preliminar divergente ou anulada pela banca organizadora.';
      changed = true;
      updatesToPush.push({
        id: q.id,
        correct_answer: null,
        is_anulada: true,
        commentary: q.commentary
      });
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf-8');
    console.log(`Atualizado arquivo local: ${file}`);
  }
}

console.log(`Total de questões para atualizar no Supabase: ${updatesToPush.length}`);

// Push to Supabase one by one or small batches
for (const u of updatesToPush) {
  const patchBody = {};
  if (u.correct_answer !== undefined) patchBody.correct_answer = u.correct_answer;
  if (u.is_anulada !== undefined) patchBody.is_anulada = u.is_anulada;
  if (u.commentary !== undefined) patchBody.commentary = u.commentary;
  if (u.options !== undefined) patchBody.options = u.options;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=eq.${u.id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(patchBody)
  });

  if (!res.ok) {
    console.error(`Falha ao atualizar ${u.id}: ${res.statusText}`);
  } else {
    console.log(`Sucesso no Supabase: ${u.id}`);
  }
}

console.log('Finalizado com sucesso!');
