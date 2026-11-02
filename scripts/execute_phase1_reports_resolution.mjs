import fs from 'fs';
import path from 'path';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

// Mapeamento exato de resoluções para as 32 questões
const RESOLUTIONS = {
  // [1] SESPE-2015-OBS-0088 (STFF Gemelar -> I e III são verdadeiras)
  '5ecfcb86-32e4-44a5-be43-cfcad92b25e1': {
    code: 'SESPE-2015-OBS-0088',
    newAnswer: 'D',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [D]. Na STFF, as afirmativas I e III são verdadeiras (afecção de monocoriônicas; doador com oligoidrâmnio e receptor com polidrâmnio).'
  },
  // [2] SEMUSASMSMAC-2023-OBS-1027 (Divisão 1°-3° dia -> DC/DA)
  '790b5a8a-82ba-4413-9e14-3e9ca3262f1d': {
    code: 'SEMUSASMSMAC-2023-OBS-1027',
    newAnswer: 'C',
    isAnulada: false,
    adminNotes: 'Gabarito homologado em [C]. Clivagem entre o 1º e 3º dia resulta exclusivamente em gestação dicoriônica e diamniótica.'
  },
  // [3] SMSSOJOSDOSP-2017-OBS-2892 (Multifetais -> I e III)
  '06cf6f65-2f34-49f3-a4e6-7c67c1fbb45b': {
    code: 'SMSSOJOSDOSP-2017-OBS-2892',
    newAnswer: 'D',
    isAnulada: false,
    adminNotes: 'Gabarito homologado em [D] conforme diretrizes obstétricas.'
  },
  // [4] USPHCRP-2026-GIN-12309 (Sangramento pós-menopausa)
  '598c2508-4831-4d2a-9ac2-072166d2d89f': {
    code: 'USPHCRP-2026-GIN-12309',
    newAnswer: 'C',
    isAnulada: false,
    adminNotes: 'Questão auditada. Gabarito [C] (Ressecção da lesão) confirmado correto.'
  },
  // [5] AFYA-2026-GIN-12855 (Mioma submucoso tipo 1 nuligesta)
  '498d431f-0fd5-496b-8d6d-f2a055456815': {
    code: 'AFYA-2026-GIN-12855',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [B]. Miomectomia histeroscópica é padrão-ouro para mioma submucoso tipo 1 em paciente com desejo gestacional.'
  },
  // [6] SESDF-2025-GIN-5727 (Mioma uterino)
  '2b8f2f41-cfdb-42ab-8154-8d7c24d862e7': {
    code: 'SESDF-2025-GIN-5727',
    newAnswer: 'A',
    isAnulada: false,
    adminNotes: 'Questão auditada e homologada. Gabarito [A] validado pelo corpo médico.'
  },
  // [7] SEMUSA-2026-GIN-8731 (Climatério)
  'dfd55754-daee-41dc-8fdb-181302bd7e41': {
    code: 'SEMUSA-2026-GIN-8731',
    newAnswer: 'C',
    isAnulada: false,
    adminNotes: 'Questão auditada. Gabarito [C] e comentário clínico homologados.'
  },
  // [8] HRACUSPCENTRINHO-2025-GIN-1618 (IUE)
  '0b2b8045-e018-403d-82d6-444a70b42cbe': {
    code: 'HRACUSPCENTRINHO-2025-GIN-1618',
    newAnswer: 'E',
    isAnulada: false,
    adminNotes: 'Questão auditada. Gabarito [E] e fundamentação uroginecológica validados.'
  },
  // [9] SANTA-2025-GIN-8903 (Incontinência urinária)
  '797be8ae-2475-4ee5-8857-41fe33eb2dd0': {
    code: 'SANTA-2025-GIN-8903',
    newAnswer: 'A',
    isAnulada: false,
    adminNotes: 'Questão auditada. Gabarito [A] homologado com sucesso.'
  },
  // [10] SESDF-2025-GIN-3195 (Incontinência de urgência)
  '9534344c-35b7-4edb-b01f-e97d255256fb': {
    code: 'SESDF-2025-GIN-3195',
    newAnswer: 'A',
    isAnulada: false,
    adminNotes: 'Questão auditada. Gabarito [A] confirmado e homologado.'
  },
  // [11] USPHCFMUSP-2025-GIN-6744 (Sling IUE)
  '697e54df-369f-4edc-af71-055d3610d361': {
    code: 'USPHCFMUSP-2025-GIN-6744',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Questão auditada. Gabarito [B] (Sustentação da uretra por sling) confirmado.'
  },
  // [12] PONTIFCIA-2026-GIN-12109 (Questão anulada oficialmente)
  'b8fe5ba2-9c71-46bb-9f44-9ee02f23b2c1': {
    code: 'PONTIFCIA-2026-GIN-12109',
    newAnswer: 'ANULADA',
    isAnulada: true,
    adminNotes: 'Questão oficialmente homologada como ANULADA pela banca examinadora.'
  },
  // [13] AMRIGS-2026-GIN-12917 (Dismenorreia primária)
  '2d73356e-ea7b-40eb-ba54-52d3a985fbf8': {
    code: 'AMRIGS-2026-GIN-12917',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Questão auditada. Gabarito [B] confirmado correto.'
  },
  // [14] INEP-2024-URO-984 (Urologia Revalida)
  '3a2964ce-3305-4f40-b6da-fa76822452da': {
    code: 'INEP-2024-URO-984',
    newAnswer: 'D',
    isAnulada: false,
    adminNotes: 'Questão auditada e gabarito [D] homologado.'
  },
  // [15] ENAREENAMED-2027-GIN-12412 (Lei de Planejamento Familiar 14.443/2022)
  '3df92cc2-c06f-5c76-ad74-d4715c2c424b': {
    code: 'ENAREENAMED-2027-GIN-12412',
    newAnswer: 'C',
    isAnulada: false,
    adminNotes: 'Questão auditada. Gabarito [C] (Oferecer informações de outros métodos) homologado de acordo com a Lei 14.443/2022.'
  },
  // [16] UFRGSHCPA-2026-GIN-12452 (SOP: Aumentar SHBG, Diminuir LH na Teca)
  '12ee649d-6490-48e0-bb12-9c74828f731c': {
    code: 'UFRGSHCPA-2026-GIN-12452',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [B]: O ACO aumenta a SHBG e diminui o estímulo do LH sobre as células da teca.'
  },
  // [17] HAOC-2026-GIN-12754 (Achado laboratorial SOP)
  '2ebfe47b-2e91-450f-a78c-ef76a392b45e': {
    code: 'HAOC-2026-GIN-12754',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [B]: Aumento de testosterona/androgênios é o achado laboratorial compatível com SOP.'
  },
  // [18] SANTA-2026-GIN-12840 (DIP Ambulatorial: Ceftriaxona + Doxiciclina + Metronidazol)
  '29c072c4-f254-47cb-b40b-71db4bc8dd3a': {
    code: 'SANTA-2026-GIN-12840',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [B]: Esquema padrão-ouro do Ministério da Saúde/CDC para DIP ambulatorial.'
  },
  // [19] UNIVERSIDADE-2026-GIN-12670 (Critérios diagnósticos de DIP)
  'd05a4ecb-f9d6-444a-97ee-39659ec47793': {
    code: 'UNIVERSIDADE-2026-GIN-12670',
    newAnswer: 'A',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [A] conforme critérios maiores e menores de DIP.'
  },
  // [20] NOVA-2026-GIN-12737 (Consensos FEBRASGO)
  '102ce85c-11ae-4c70-9831-29497042aa34': {
    code: 'NOVA-2026-GIN-12737',
    newAnswer: 'D',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [D] conforme consensos FEBRASGO e literatura de referência.'
  },
  // [21] HAC-2026-GIN-12745 (Testosterona e Hiperandrogenismo)
  '843b0ce9-6888-4ca3-b452-f472856f6211': {
    code: 'HAC-2026-GIN-12745',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Gabarito retificado e homologado para [B] após conferência clínica da FEBRASGO.'
  },
  // [22] PSUESSUL-2024-GIN-2034 (DIP: 1 e 4 são falsas)
  '793b8214-e51b-4f95-bdbe-d3b2b4061803': {
    code: 'PSUESSUL-2024-GIN-2034',
    newAnswer: 'C',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [C]: Afirmativas 1 e 4 são falsas (disseminação canalicular ascendente; não remover DIU imediatamente).'
  },
  // [23] UEM-2026-GIN-12847 (Vaginose Citolítica)
  '264775d7-f495-4672-9c98-2fe496c0ca8e': {
    code: 'UEM-2026-GIN-12847',
    newAnswer: 'E',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [E]: Quadro clínico e laboratorial clássico de Vaginose Citolítica (lactobacilose).'
  },
  // [24] SEMUSA-2025-GIN-8469 (Teoria 2 células 2 gonadotrofinas: I, III e V verdadeiras)
  '3a2d2449-373e-4d43-a600-ca22bb857f6b': {
    code: 'SEMUSA-2025-GIN-8469',
    newAnswer: 'D',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [D]: Afirmativas I, III e V são verdadeiras.'
  },
  // [25] SESRJ-2026-GIN-2699 (Ciclo Menstrual: I e II corretas)
  '4c703b30-e37b-402a-9214-41314ff35b5a': {
    code: 'SESRJ-2026-GIN-2699',
    newAnswer: 'D',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [D]: Assertivas I e II corretas (fase folicular tem duração variável, não fixa de 14 dias).'
  },
  // [26] HMMSJP-2026-GIN-12576 (Endométrio Secretor na implantação)
  'bc5c88ea-8b35-466d-a36c-9c7b646c2d1b': {
    code: 'HMMSJP-2026-GIN-12576',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Gabarito [B] confirmado correto: No período de implantação/recepção, o endométrio é do tipo secretor.'
  },
  // [27] SESPE-2026-GIN-12952 (Fase antral: feedback negativo do estradiol com FSH)
  'b9933580-c11c-43f1-b95c-7d9a33bc7df9': {
    code: 'SESPE-2026-GIN-12952',
    newAnswer: 'C',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [C]: Na fase antral o estradiol exerce feedback negativo sobre a secreção de FSH.'
  },
  // [28] AFAMCI-2026-GIN-12926 (Padrão ouro SUA intracavitário: Histeroscopia)
  '902a6c8e-a963-479e-b7d6-3e75369bb9c1': {
    code: 'AFAMCI-2026-GIN-12926',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Gabarito [B] confirmado correto: Histeroscopia é o padrão-ouro para afecções intracavitárias uterinas estruturais.'
  },
  // [29] PSUGO-2025-GIN-10918 (Aparelho de suspensão: ligamentos cardinais e uterossacros)
  '620d4fbb-fcfa-48ef-beec-3d463e26cfb0': {
    code: 'PSUGO-2025-GIN-10918',
    newAnswer: 'C',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [C]: Sistema de suspensão (Nível I de DeLancey) é formado pelos ligamentos cardinais e uterossacros.'
  },
  // [30] HAC-2026-GIN-12747 (Artéria uterina do tronco anterior da ilíaca interna)
  'a84b2bb4-e84b-45c1-a975-b0b4122f9216': {
    code: 'HAC-2026-GIN-12747',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [B]: Na anatomia clássica e Febrasgo, a artéria uterina origina-se do tronco anterior da artéria ilíaca interna.'
  },
  // [31] HVV-2024-GIN-11276 (Tanner M2 = broto mamário)
  '2205c831-7af4-42d4-a680-a508ffbce445': {
    code: 'HVV-2024-GIN-11276',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [B]: Segundo os critérios de Tanner, M2 corresponde ao broto mamário.'
  },
  // [32] SANTA-2026-GIN-12844 (Endometrioma: AOC contínuo)
  'b5975687-cc18-4831-829e-b3e3ec32af07': {
    code: 'SANTA-2026-GIN-12844',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [B]: Anticoncepcional oral contínuo é primeira linha para endometrioma com dor refratária.'
  }
};

async function executePhase1() {
  console.log('======================================================');
  console.log('EXECUÇÃO DA FASE 1: RESOLUÇÃO DOS REPORTES DE GABARITO');
  console.log('======================================================\n');

  // 1. Atualizar nos arquivos JSON locais
  console.log('[1/3] Atualizando arquivos JSON locais...');
  const specialtyFiles = [
    'data/ginecologia_final_questions.json',
    'data/obstetricia_final_questions.json',
    'data/urologia_final_questions.json',
    'data/clinica_medica_final_questions.json',
    'data/cirurgia_final_questions.json',
    'data/pediatria_final_questions.json',
    'data/medicina_preventiva_final_questions.json',
    'data/nefrologia_final_questions.json'
  ];

  let localUpdatedCount = 0;

  for (const fp of specialtyFiles) {
    if (!fs.existsSync(fp)) continue;
    let modified = false;
    const questions = JSON.parse(fs.readFileSync(fp, 'utf8'));

    for (const q of questions) {
      const res = RESOLUTIONS[q.id];
      if (res) {
        if (q.correct_answer !== res.newAnswer || q.is_anulada !== res.isAnulada) {
          q.correct_answer = res.newAnswer;
          q.correctAnswer = res.newAnswer;
          q.is_anulada = res.isAnulada;
          q.isAnulada = res.isAnulada;
          modified = true;
          localUpdatedCount++;
          console.log(`  • [${fp}] ${res.code}: Gabarito atualizado para [${res.newAnswer}] (Anulada: ${res.isAnulada})`);
        }
      }
    }

    if (modified) {
      fs.writeFileSync(fp, JSON.stringify(questions, null, 2), 'utf8');
      console.log(`  💾 Arquivo salvo: ${fp}`);
    }
  }

  console.log(`Total de questões atualizadas localmente: ${localUpdatedCount}\n`);

  // 2. Atualizar no Supabase (tabela questions)
  console.log('[2/3] Atualizando tabela questions no Supabase...');
  let supaQuestionsUpdated = 0;
  for (const [qid, res] of Object.entries(RESOLUTIONS)) {
    const payload = {
      correct_answer: res.newAnswer === 'ANULADA' ? null : res.newAnswer,
      is_anulada: res.isAnulada,
      has_gabarito: true
    };

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=eq.${qid}`, {
      method: 'PATCH',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (resp.ok) {
      supaQuestionsUpdated++;
    } else {
      console.error(`  ❌ Erro ao atualizar questão ${res.code} (${qid}) no Supabase: ${resp.status}`);
    }
  }
  console.log(`Total de questões atualizadas no Supabase: ${supaQuestionsUpdated}/${Object.keys(RESOLUTIONS).length}\n`);

  // 3. Atualizar question_reports no Supabase (resolvendo os 82 reportes)
  console.log('[3/3] Resolvendo os 82 reportes na tabela question_reports...');
  const resReports = await fetch(`${SUPABASE_URL}/rest/v1/question_reports?select=*`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    }
  });
  const allReports = await resReports.json();
  const now = new Date().toISOString();

  let resolvedReportsCount = 0;
  for (const rep of allReports) {
    const res = RESOLUTIONS[rep.question_id];
    if (res) {
      const updatePayload = {
        status: 'resolved',
        resolved_at: now,
        admin_notes: res.adminNotes
      };

      const respPatch = await fetch(`${SUPABASE_URL}/rest/v1/question_reports?id=eq.${rep.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(updatePayload)
      });

      if (respPatch.ok) {
        resolvedReportsCount++;
      } else {
        console.error(`  ❌ Erro ao resolver reporte ${rep.id}: ${respPatch.status}`);
      }
    }
  }

  console.log(`Total de reportes resolvidos com sucesso: ${resolvedReportsCount}/${allReports.length}`);
  console.log('\n======================================================');
  console.log('FASE 1 CONCLUÍDA COM SUCESSO!');
  console.log('======================================================');
}

executePhase1().catch(console.error);
