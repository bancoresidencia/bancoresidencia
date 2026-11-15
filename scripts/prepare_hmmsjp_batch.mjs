import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      }
    }
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const items = [
  {
    code: 'HMMSJP-2026-OBS-13407',
    correct_answer: 'D',
    commentary: 'Gabarito oficial: D. De acordo com a Resolução CFM nº 1.989/2012, o diagnóstico de anencefalia fetal deve ser confirmado e documentado por dois médicos mediante ultrassonografia detalhada com registros fotográficos. Conforme jurisprudência vinculante do STF na ADPF 54, a antecipação terapêutica do parto em fetos anencéfalos não é crime e não requer autorização judicial prévia, devendo a paciente ser encaminhada a centro de referência caso opte pela interrupção legal.',
    simEnunciado: 1.0,
    simAlternativa: 1.0,
    origem: 'FAFIPA / HMMSJP 2026 - Resolução CFM 1.989/2012 e ADPF 54 STF'
  },
  {
    code: 'HMMSJP-2023-OBS-4726',
    correct_answer: 'E',
    commentary: 'Gabarito oficial: E. Em gestações gemelares há aumento estatisticamente comprovado de múltiplas complicações materno-fetais, incluindo pré-eclâmpsia (risco 2 a 3 vezes superior), diabetes mellitus gestacional, eventos tromboembólicos venosos (TVP) e parto prematuro (prematuridade espontânea ou indicada). Portanto, todas as assertivas anteriores (A, B, C e D) são verdadeiras.',
    simEnunciado: 1.0,
    simAlternativa: 1.0,
    origem: 'FAFIPA / HMMSJP 2023 - FEBRASGO / Williams Obstetrícia'
  },
  {
    code: 'HMMSJP-2024-MPS-7188',
    correct_answer: 'B',
    commentary: 'Gabarito oficial: B. O modelo de Acesso Avançado (Advanced Access / Open Access) na Atenção Primária à Saúde preconiza que a maior fatia das consultas do dia (geralmente de 65% a 75%) seja mantida sem agendamento prévio, aberta para resolução no mesmo dia da demanda espontânea sob o lema "Faça hoje o trabalho de hoje", reduzindo o absenteísmo e as filas.',
    simEnunciado: 1.0,
    simAlternativa: 1.0,
    origem: 'FAFIPA / HMMSJP 2024 - Tratado de Medicina de Família e Comunidade'
  },
  {
    code: 'HMMSJP-2024-CLM-1709',
    correct_answer: 'B',
    commentary: 'Gabarito oficial: B. Os critérios diagnósticos canônicos da Gamopatia Monoclonal de Significado Indeterminado (GMSI/MGUS) exigem: proteína monoclonal sérica < 3 g/dL, infiltração de plasmócitos clonais na medula óssea < 10% e ausência absoluta de lesões de órgãos-alvo relacionadas ao mieloma (critérios CRAB: hipercalcemia, disfunção renal, anemia e lesões ósseas líticas).',
    simEnunciado: 1.0,
    simAlternativa: 1.0,
    origem: 'FAFIPA / HMMSJP 2024 - Diretrizes ABHH / International Myeloma Working Group'
  },
  {
    code: 'HMMSJP-2023-OBS-11902',
    correct_answer: 'C',
    commentary: 'Gabarito oficial: C. Trata-se de gestação com sofrimento fetal agudo grave e asfixia iminente evidenciados por perfil biofísico fetal crítico (PBF 2/10), cardiotocografia não-tranquilizadora e líquido amniótico meconial verde espesso, associados à macrossomia fetal extrema estimada em 5.800g e colo desfavorável (1 cm). A indução do parto vaginal é absolutamente contraindicada; a conduta de urgência mandatória para salvar o concepto é a realização imediata de cesariana.',
    simEnunciado: 1.0,
    simAlternativa: 1.0,
    origem: 'FAFIPA / HMMSJP 2023 - Manual de Gestação de Alto Risco do Ministério da Saúde'
  }
];

async function prepare() {
  console.log('Buscando IDs no Supabase para as 5 questões...');
  const codes = items.map(i => i.code);
  const { data, error } = await supabase
    .from('questions')
    .select('id, code, year, institution, statement, correct_answer')
    .in('code', codes);

  if (error) {
    console.error('Erro na busca:', error);
    return;
  }

  const staged = items.map(item => {
    const q = data.find(d => d.code === item.code);
    return {
      id: q?.id,
      code: item.code,
      year: q?.year,
      correct_answer: item.correct_answer,
      commentary: item.commentary,
      simEnunciado: item.simEnunciado,
      simAlternativa: item.simAlternativa,
      origem: item.origem,
      currentDbAnswer: q?.correct_answer
    };
  });

  fs.writeFileSync('data/staging_fase1_fafipa_hmmsjp.json', JSON.stringify(staged, null, 2), 'utf8');
  console.log(`Sucesso: 5 questões salvas em data/staging_fase1_fafipa_hmmsjp.json!`);
  console.log(staged.map(s => `${s.code} -> Gab: ${s.correct_answer} (ID: ${s.id})`));
}

prepare().catch(console.error);
