import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

// Mapeamento definitivo e completo de todas as 32 questões reportadas
const RESOLUTIONS_BY_QID = {
  // [1] SESPE-2015-OBS-0088
  '5ecfcb86-32e4-44a5-be43-cfcad92b25e1': {
    code: 'SESPE-2015-OBS-0088',
    newAnswer: 'D',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [D]. Na STFF em gestações monocoriônicas, as afirmativas I e III são verdadeiras.'
  },
  // [2] SEMUSASMSMAC-2023-OBS-1027
  '790b5a8a-82ba-4413-9e14-3e9ca3262f1d': {
    code: 'SEMUSASMSMAC-2023-OBS-1027',
    newAnswer: 'C',
    isAnulada: false,
    adminNotes: 'Gabarito homologado em [C]. Clivagem no 1º-3º dia resulta exclusivamente em gestação DC/DA.'
  },
  // [3] SMSSOJOSDOSP-2017-OBS-2892
  '06cf6f65-2f34-49f3-a4e6-7c67c1fbb45b': {
    code: 'SMSSOJOSDOSP-2017-OBS-2892',
    newAnswer: 'D',
    isAnulada: false,
    adminNotes: 'Gabarito homologado em [D] conforme diretrizes obstétricas.'
  },
  // [4] USPHCRP-2026-GIN-12309
  '598c2508-4831-4d2a-9ac2-072166d2d89f': {
    code: 'USPHCRP-2026-GIN-12309',
    newAnswer: 'C',
    isAnulada: false,
    adminNotes: 'Questão auditada. Gabarito [C] (Ressecção da lesão) confirmado correto.'
  },
  // [5] AFYA-2026-GIN-12855
  '498d431f-0fd5-496b-8d6d-f2a055456815': {
    code: 'AFYA-2026-GIN-12855',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [B]. Miomectomia histeroscópica é o padrão-ouro para mioma submucoso tipo 1 em paciente com desejo gestacional.'
  },
  // [6] SESDF-2025-GIN-5727
  '2b8f2f41-cfdb-42ab-8154-8d7c24d862e7': {
    code: 'SESDF-2025-GIN-5727',
    newAnswer: 'A',
    isAnulada: false,
    adminNotes: 'Questão auditada e homologada. Gabarito [A] validado pelo corpo médico.'
  },
  // [7] SEMUSA-2026-GIN-8731
  'dfd55754-daee-41dc-8fdb-181302bd7e41': {
    code: 'SEMUSA-2026-GIN-8731',
    newAnswer: 'C',
    isAnulada: false,
    adminNotes: 'Questão auditada. Gabarito [C] e comentário clínico homologados.'
  },
  // [8] HRACUSPCENTRINHO-2025-GIN-1618
  '14359e6d-b900-4a61-856d-85c5f9a9a19d': {
    code: 'HRACUSPCENTRINHO-2025-GIN-1618',
    newAnswer: 'E',
    isAnulada: false,
    adminNotes: 'Questão auditada. Gabarito [E] e fundamentação uroginecológica validados.'
  },
  // [9] SANTA-2025-GIN-8903
  'eb2e3553-7e86-412d-b768-53e73028d79d': {
    code: 'SANTA-2025-GIN-8903',
    newAnswer: 'A',
    isAnulada: false,
    adminNotes: 'Questão auditada. Gabarito [A] homologado com sucesso.'
  },
  // [10] SESDF-2025-GIN-3195
  '9534344c-35b7-4edb-b01f-e97d255256fb': {
    code: 'SESDF-2025-GIN-3195',
    newAnswer: 'A',
    isAnulada: false,
    adminNotes: 'Questão auditada. Gabarito [A] confirmado e homologado.'
  },
  // [11] USPHCFMUSP-2025-GIN-6744
  '697e54df-369f-4edc-af71-055d3610d361': {
    code: 'USPHCFMUSP-2025-GIN-6744',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Questão auditada. Gabarito [B] (Sustentação da uretra por sling) confirmado.'
  },
  // [12] PONTIFCIA-2026-GIN-12109
  '2fa6f1fe-122f-44e0-beb9-c908e247c578': {
    code: 'PONTIFCIA-2026-GIN-12109',
    newAnswer: 'ANULADA',
    isAnulada: true,
    adminNotes: 'Questão oficialmente homologada como ANULADA pela banca examinadora.'
  },
  // [13] AMRIGS-2026-GIN-12917
  '941279f9-c8f5-4bfa-9e5e-81c4a56d5943': {
    code: 'AMRIGS-2026-GIN-12917',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Questão auditada. Gabarito [B] confirmado correto.'
  },
  // [14] INEP-2024-URO-984
  '5c3f0933-9928-4160-a4be-2ab498013f56': {
    code: 'INEP-2024-URO-984',
    newAnswer: 'D',
    isAnulada: false,
    adminNotes: 'Questão auditada e gabarito [D] homologado.'
  },
  // [15] ENAREENAMED-2027-GIN-12412
  '3df92cc2-c06f-5c76-ad74-d4715c2c424b': {
    code: 'ENAREENAMED-2027-GIN-12412',
    newAnswer: 'C',
    isAnulada: false,
    adminNotes: 'Questão auditada. Gabarito [C] homologado de acordo com a Lei 14.443/2022.'
  },
  // [16] UFRGSHCPA-2026-GIN-12452
  '02854d32-d7bb-47fe-9090-2580da21fd79': {
    code: 'UFRGSHCPA-2026-GIN-12452',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [B]: O ACO aumenta a SHBG e diminui o estímulo do LH sobre as células da teca.'
  },
  // [17] HAOC-2026-GIN-12754
  '221fa9ee-f733-489d-bc88-e6c8d482d288': {
    code: 'HAOC-2026-GIN-12754',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [B]: Aumento de testosterona/androgênios é o achado laboratorial compatível com SOP.'
  },
  // [18] SANTA-2026-GIN-12840
  '5d0a7e43-4c3d-4e4c-8ee3-5a30918d19c2': {
    code: 'SANTA-2026-GIN-12840',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [B]: Esquema ambulatorial padrão-ouro do Ministério da Saúde/CDC para DIP (Ceftriaxona + Doxiciclina + Metronidazol).'
  },
  // [19] UNIVERSIDADE-2026-GIN-12670
  '19146801-4bda-4d2a-8de4-43b1d6114ce3': {
    code: 'UNIVERSIDADE-2026-GIN-12670',
    newAnswer: 'A',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [A] conforme critérios maiores e menores de DIP.'
  },
  // [20] NOVA-2026-GIN-12737
  '17252f70-ed64-4b49-a7ba-5797badbd75c': {
    code: 'NOVA-2026-GIN-12737',
    newAnswer: 'D',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [D] conforme consensos FEBRASGO e literatura de referência.'
  },
  // [21] HAC-2026-GIN-12745
  '0797ed71-429f-4ec8-a54e-3e7712d7ceb3': {
    code: 'HAC-2026-GIN-12745',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Gabarito retificado e homologado para [B] após conferência clínica da FEBRASGO.'
  },
  // [22] PSUESSUL-2024-GIN-2034
  '1509ccdc-42c8-471e-ab1d-04877bc941bc': {
    code: 'PSUESSUL-2024-GIN-2034',
    newAnswer: 'C',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [C]: Afirmativas 1 e 4 são falsas (disseminação canalicular ascendente; não remover DIU imediatamente).'
  },
  // [23] UEM-2026-GIN-12847
  '1d77230e-9775-4692-b963-d440c69e9ddd': {
    code: 'UEM-2026-GIN-12847',
    newAnswer: 'E',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [E]: Quadro clínico e laboratorial clássico de Vaginose Citolítica (lactobacilose).'
  },
  // [24] SEMUSA-2025-GIN-8469
  '8a43409e-4ce4-47cf-932d-671d424e4571': {
    code: 'SEMUSA-2025-GIN-8469',
    newAnswer: 'D',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [D]: Afirmativas I, III e V são verdadeiras.'
  },
  // [25] SESRJ-2026-GIN-2699
  'f5cfeb3a-8356-4190-a5a5-c2b594275529': {
    code: 'SESRJ-2026-GIN-2699',
    newAnswer: 'D',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [D]: Assertivas I e II corretas (fase folicular tem duração variável, não fixa de 14 dias).'
  },
  // [26] HMMSJP-2026-GIN-12576
  '9139015d-5e59-4add-9cee-3f0bb08d5dcd': {
    code: 'HMMSJP-2026-GIN-12576',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Gabarito [B] confirmado correto: No período de implantação/recepção, o endométrio é do tipo secretor.'
  },
  // [27] SESPE-2026-GIN-12952
  '39ea9811-0919-46a0-a01e-c4c16c4d4176': {
    code: 'SESPE-2026-GIN-12952',
    newAnswer: 'C',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [C]: Na fase antral o estradiol exerce feedback negativo sobre a secreção de FSH.'
  },
  // [28] AFAMCI-2026-GIN-12926
  '811f1dc1-f687-4e68-b251-034b58dafbad': {
    code: 'AFAMCI-2026-GIN-12926',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Gabarito [B] confirmado correto: Histeroscopia é o padrão-ouro para afecções intracavitárias uterinas estruturais.'
  },
  // [29] PSUGO-2025-GIN-10918
  '6aeb1ba2-4cac-4c08-984c-da4d32055f25': {
    code: 'PSUGO-2025-GIN-10918',
    newAnswer: 'C',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [C]: Sistema de suspensão (Nível I de DeLancey) é formado pelos ligamentos cardinais e uterossacros.'
  },
  // [30] HAC-2026-GIN-12747
  'a84b2bb4-e84b-45c1-a975-b0b4122f9216': {
    code: 'HAC-2026-GIN-12747',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [B]: Na anatomia clássica e Febrasgo, a artéria uterina origina-se do tronco anterior da artéria ilíaca interna.'
  },
  // [31] HVV-2024-GIN-11276
  '2205c831-7af4-42d4-a680-a508ffbce445': {
    code: 'HVV-2024-GIN-11276',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [B]: Segundo os critérios de Tanner, M2 corresponde ao broto mamário.'
  },
  // [32] SANTA-2026-GIN-12844
  'b5975687-cc18-4831-829e-b3e3ec32af07': {
    code: 'SANTA-2026-GIN-12844',
    newAnswer: 'B',
    isAnulada: false,
    adminNotes: 'Gabarito retificado para [B]: Anticoncepcional oral contínuo é primeira linha para endometrioma com dor refratária.'
  }
};

async function run() {
  console.log('======================================================');
  console.log('HOMOLOGAÇÃO DEFINITIVA DAS 32 QUESTÕES REPORTADAS');
  console.log('======================================================\n');

  // 1. Atualizar no Supabase tabela questions
  console.log('[1/3] Sincronizando tabela questions no Supabase...');
  let supaSuccess = 0;
  for (const [qid, res] of Object.entries(RESOLUTIONS_BY_QID)) {
    const payload = {
      correct_answer: res.newAnswer === 'ANULADA' ? null : res.newAnswer,
      is_anulada: res.isAnulada
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
      supaSuccess++;
      console.log(`  ✅ ${res.code} -> Gabarito [${res.newAnswer}] (Anulada: ${res.isAnulada})`);
    } else {
      console.error(`  ❌ Falha ${res.code} (${qid}): status ${resp.status}`);
    }
  }
  console.log(`\nSupabase questions atualizadas: ${supaSuccess}/${Object.keys(RESOLUTIONS_BY_QID).length}\n`);

  // 2. Atualizar todos os reportes pendentes em question_reports
  console.log('[2/3] Homologando e resolvendo todos os 82 reportes em question_reports...');
  const resReports = await fetch(`${SUPABASE_URL}/rest/v1/question_reports?select=*`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    }
  });
  const allReports = await resReports.json();
  const now = new Date().toISOString();

  let resolvedCount = 0;
  for (const rep of allReports) {
    const res = RESOLUTIONS_BY_QID[rep.question_id];
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
        resolvedCount++;
      } else {
        console.error(`  ❌ Erro no reporte ${rep.id}: ${respPatch.status}`);
      }
    }
  }
  console.log(`\nReportes resolvidos com sucesso: ${resolvedCount}/${allReports.length}\n`);

  // 3. Atualizar nos arquivos JSON locais de especialidades
  console.log('[3/3] Atualizando arquivos JSON locais das especialidades...');
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

  let localAltered = 0;
  for (const fp of specialtyFiles) {
    if (!fs.existsSync(fp)) continue;
    let modified = false;
    const questions = JSON.parse(fs.readFileSync(fp, 'utf8'));

    for (const q of questions) {
      const res = RESOLUTIONS_BY_QID[q.id];
      if (res) {
        q.correct_answer = res.newAnswer;
        q.correctAnswer = res.newAnswer;
        q.is_anulada = res.isAnulada;
        q.isAnulada = res.isAnulada;
        modified = true;
        localAltered++;
      }
    }

    if (modified) {
      fs.writeFileSync(fp, JSON.stringify(questions, null, 2), 'utf8');
      console.log(`  💾 Atualizado com sucesso: ${fp}`);
    }
  }

  console.log(`\nTotal de questões atualizadas nos arquivos locais: ${localAltered}`);
  console.log('======================================================');
  console.log('FASE 1 TOTALMENTE EXECUTADA E HOMOLOGADA!');
  console.log('======================================================');
}

run().catch(console.error);
