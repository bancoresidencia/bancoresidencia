import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const MASTER_LIVE_PATH = 'data/relatorio_gabaritos_sessao_live.json';

const resolutions = [
  { code: 'SEMUSASMSMAC-2026-CLM-0460', letter: 'D', origin: 'Macaé 2026 Oficial (GB Edital 001/2025)' },
  { code: 'SEMUSASMSMAC-2026-CIR-14803', letter: 'D', origin: 'Macaé 2026 Oficial (GB Edital 001/2025)' },
  { code: 'SEMUSASMSMAC-2026-MPS-18950', letter: 'A', origin: 'Macaé 2026 Oficial (GB Edital 001/2025)' },
  { code: 'SEMUSASMSMAC-2026-CIR-18674', letter: 'D', origin: 'Macaé 2026 Oficial (GB Edital 001/2025)' },
  { code: 'SEMUSASMSMAC-2026-CIR-17324', letter: 'C', origin: 'Macaé 2026 Oficial (GB Edital 001/2025)' },
  { code: 'SEMUSASMSMAC-2026-PED-4305', letter: 'B', origin: 'Macaé 2026 Oficial (GB Edital 001/2025)' },
  { code: 'SEMUSASMSMAC-2026-PED-6602', letter: 'A', origin: 'Macaé 2026 Oficial (GB Edital 001/2025)' },
  { code: 'SEMUSASMSMAC-2026-PED-8534', letter: 'C', origin: 'Macaé 2026 Oficial (GB Edital 001/2025)' },
  { code: 'SEMUSASMSMAC-2026-CIR-14016', letter: 'C', origin: 'Macaé 2026 Oficial (GB Edital 001/2025)' },
  { code: 'SEMUSASMSMAC-2026-CIR-4834', letter: 'B', origin: 'Macaé 2026 Oficial (GB Edital 001/2025)' },
  { code: 'SEMUSASMSMAC-2026-CIR-5695', letter: 'B', origin: 'Macaé 2026 Oficial (GB Edital 001/2025)' },
  { code: 'SEMUSASMSMAC-2026-CIR-16205', letter: 'A', origin: 'Macaé 2026 Oficial (GB Edital 001/2025)' },
  { code: 'SEMUSASMSMAC-2026-CIR-10563', letter: 'B', origin: 'Macaé 2026 Oficial (GB Edital 001/2025)' },
  { code: 'SEMUSASMSMAC-2026-OBS-10702', letter: 'C', origin: 'Macaé 2026 Oficial (GB Edital 001/2025)' },
  { code: 'SEMUSASMSMAC-2026-CLM-15727', letter: 'B', origin: 'Macaé 2026 Oficial (GB Edital 001/2025)' },
  { code: 'SEMUSASMSMAC-2026-CLM-23614', letter: 'D', origin: 'Macaé 2026 Oficial (GB Edital 001/2025)' },
  { code: 'SEMUSASMSMAC-2026-CIR-11672', letter: 'C', origin: 'Macaé 2026 Oficial (GB Edital 001/2025)' }
];

async function applyResolutions() {
  console.log(`Aplicando ${resolutions.length} resoluções estritas de gabarito para SEMUSA Macaé 2026...`);
  let master = { totalGravadas: 0, questoes: [] };
  if (fs.existsSync(MASTER_LIVE_PATH)) {
    try {
      master = JSON.parse(fs.readFileSync(MASTER_LIVE_PATH, 'utf8'));
    } catch (e) {}
  }
  const existingCodes = new Set((master.questoes || []).map(q => q.code));

  let count = 0;
  for (const item of resolutions) {
    const { error } = await supabase
      .from('questions')
      .update({ correct_answer: item.letter })
      .eq('code', item.code);

    if (error) {
      console.error(`❌ Erro ao atualizar ${item.code}:`, error.message);
    } else {
      count++;
      console.log(`⚡ [SUPABASE] ${item.code} -> Gabarito [${item.letter}]`);
      if (!existingCodes.has(item.code)) {
        master.questoes.push({
          code: item.code,
          gabarito: item.letter,
          origem: item.origin,
          status: 'Gravado no Supabase (Apenas Gabarito)',
          timestamp: new Date().toISOString()
        });
        existingCodes.add(item.code);
      }
    }
  }

  master.totalGravadas = master.questoes.length;
  master.ultimaAtualizacao = new Date().toISOString();
  fs.writeFileSync(MASTER_LIVE_PATH, JSON.stringify(master, null, 2), 'utf8');
  console.log(`\n✅ Sucesso: ${count}/${resolutions.length} atualizadas no Supabase e gravadas no relatório live!`);
}

applyResolutions();
