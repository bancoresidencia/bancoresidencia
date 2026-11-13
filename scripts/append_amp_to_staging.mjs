import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const ampMatches = [
  { code: 'AMP-2025-OBS-2852', qNum: 33, gb: 'C', stmtSim: 0.98, optSim: 1.0 },
  { code: 'AMP-2025-CIR-2971', qNum: 100, gb: 'B', stmtSim: 0.99, optSim: 1.0 },
  { code: 'AMP-2025-CLM-28322', qNum: 67, gb: 'E', stmtSim: 0.96, optSim: 1.0 },
  { code: 'AMP-2025-MPS-7040', qNum: 91, gb: 'D', stmtSim: 0.98, optSim: 1.0 },
  { code: 'AMP-2025-CIR-1946', qNum: 90, gb: 'E', stmtSim: 0.97, optSim: 1.0 },
  { code: 'AMP-2025-CIR-4510', qNum: 96, gb: 'C', stmtSim: 0.99, optSim: 1.0 }
];

async function main() {
  const stagingPath = 'data/staging_homologados_85pct.json';
  let staging = { ultimaAtualizacao: new Date().toISOString(), totalHomologados: 0, decisoes: [] };
  if (fs.existsSync(stagingPath)) {
    staging = JSON.parse(fs.readFileSync(stagingPath, 'utf8'));
  }

  for (const item of ampMatches) {
    if (staging.decisoes.some(d => d.code === item.code)) {
      console.log(`Já em staging: ${item.code}`);
      continue;
    }

    const { data, error } = await supabase
      .from('questions')
      .select('id, code, year, statement, options')
      .eq('code', item.code)
      .single();

    if (error || !data) {
      console.error(`Erro ao buscar ${item.code}:`, error);
      continue;
    }

    staging.decisoes.push({
      id: data.id,
      code: data.code,
      ano: data.year,
      caderno: 'AMP 2024 (Prova Geral OCR Nativo)',
      qNum: item.qNum,
      similaridadeEnunciado: item.stmtSim,
      similaridadeAlternativa: item.optSim,
      gabaritoOficialExtraido: item.gb,
      gabaritoMapeadoNoBanco: item.gb,
      foiRemapeado: false,
      isAnulada: false,
      dataHomologacao: new Date().toISOString()
    });
    console.log(`✅ Adicionado ao staging: ${data.code} -> Q#${item.qNum} GB=${item.gb}`);
  }

  staging.totalHomologados = staging.decisoes.length;
  staging.ultimaAtualizacao = new Date().toISOString();
  fs.writeFileSync(stagingPath, JSON.stringify(staging, null, 2));

  console.log(`\nStaging atualizado! Total homologados: ${staging.totalHomologados}`);
}

main().catch(console.error);

