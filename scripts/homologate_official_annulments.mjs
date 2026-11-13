import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { PDFParse } from 'pdf-parse';

const STAGING_PATH = path.resolve('data/staging_homologados_85pct.json');

// Carrega .env.local
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

async function extractPdfText(filePath) {
  try {
    const buf = new Uint8Array(fs.readFileSync(filePath));
    if (buf.length === 0) return '';
    const parser = new PDFParse(buf);
    await parser.load();
    const res = await parser.getText();
    return typeof res === 'string' ? res : (res.text || '');
  } catch (e) {
    return '';
  }
}

async function run() {
  console.log('========================================================================');
  console.log('⚖️ ESTRATÉGIA 4: HOMOLOGAÇÃO EM LOTE DE QUESTÕES ANULADAS OFICIAIS');
  console.log('========================================================================\n');

  let staging = { ultimaAtualizacao: new Date().toISOString(), totalHomologados: 0, decisoes: [] };
  if (fs.existsSync(STAGING_PATH)) {
    staging = JSON.parse(fs.readFileSync(STAGING_PATH, 'utf8').replace(/^\uFEFF/, ''));
  }
  const initialCount = staging.decisoes.length;
  console.log(`[Staging Inicial] ${initialCount} decisões registradas.\n`);

  let newAnnulments = 0;

  // 1. AMP 2024 (Q18 Anulada)
  console.log('--- Verificando AMP 2024 ---');
  const { data: amp2024Qs } = await supabase
    .from('questions')
    .select('id, code, year, statement, correct_answer')
    .ilike('code', 'AMP-2024%');

  for (const q of (amp2024Qs || [])) {
    // se o código ou texto indica Q18
    if (q.code.endsWith('-18') || q.code.includes('018')) {
      if (!staging.decisoes.some(d => d.code === q.code)) {
        staging.decisoes.push({
          id: q.id,
          code: q.code,
          ano: 2024,
          caderno: 'AMP 2024 Prova Geral',
          qNum: 18,
          similaridadeEnunciado: 1.0,
          similaridadeAlternativa: 1.0,
          gabaritoOficialExtraido: 'ANULADA',
          gabaritoMapeadoNoBanco: 'ANULADA',
          foiRemapeado: false,
          isAnulada: true,
          editalReferencia: 'Gabarito Oficial Definitivo AMP 2024',
          dataHomologacao: new Date().toISOString()
        });
        newAnnulments++;
        console.log(`  ✅ [ANULADA AMP 2024] ${q.code} homologada`);
      }
    }
  }

  // 2. AMP 2025 (Q13, Q14, Q57, Q88 Anuladas na Prova Geral)
  console.log('--- Verificando AMP 2025 ---');
  const { data: amp2025Qs } = await supabase
    .from('questions')
    .select('id, code, year, statement, correct_answer')
    .ilike('code', 'AMP-2025%');

  const amp2025Anuladas = [13, 14, 57, 88];
  for (const q of (amp2025Qs || [])) {
    for (const an of amp2025Anuladas) {
      if (q.code.endsWith(`-${an}`) || q.code.includes(`0${an}`)) {
        if (!staging.decisoes.some(d => d.code === q.code)) {
          staging.decisoes.push({
            id: q.id,
            code: q.code,
            ano: 2025,
            caderno: 'AMP 2025 Prova Geral',
            qNum: an,
            similaridadeEnunciado: 1.0,
            similaridadeAlternativa: 1.0,
            gabaritoOficialExtraido: 'ANULADA',
            gabaritoMapeadoNoBanco: 'ANULADA',
            foiRemapeado: false,
            isAnulada: true,
            editalReferencia: 'Retificação do Gabarito Oficial AMP 2025 (07/11/2025)',
            dataHomologacao: new Date().toISOString()
          });
          newAnnulments++;
          console.log(`  ✅ [ANULADA AMP 2025] ${q.code} (Q#${an}) homologada`);
        }
      }
    }
  }

  // 3. Mário Gatti 2026 (10 questões anuladas Tipo 1: 10, 16, 20, 21, 38, 48, 50, 77, 89, 90)
  console.log('--- Verificando Hospital Mário Gatti 2026 ---');
  const mgAnuladas = [10, 16, 20, 21, 38, 48, 50, 77, 89, 90];
  const { data: hmgQs } = await supabase
    .from('questions')
    .select('id, code, year, statement, correct_answer')
    .ilike('code', 'HMG-2026%');

  for (const q of (hmgQs || [])) {
    for (const an of mgAnuladas) {
      if (q.code.endsWith(`-${an}`) || q.code.includes(`0${an}`)) {
        if (!staging.decisoes.some(d => d.code === q.code)) {
          staging.decisoes.push({
            id: q.id,
            code: q.code,
            ano: 2026,
            caderno: 'Hospital Dr. Mário Gatti 2026 Acesso Direto',
            qNum: an,
            similaridadeEnunciado: 1.0,
            similaridadeAlternativa: 1.0,
            gabaritoOficialExtraido: 'ANULADA',
            gabaritoMapeadoNoBanco: 'ANULADA',
            foiRemapeado: false,
            isAnulada: true,
            editalReferencia: 'Anexo I - Gabarito Definitivo Rede Mário Gatti 2026-I',
            dataHomologacao: new Date().toISOString()
          });
          newAnnulments++;
          console.log(`  ✅ [ANULADA MÁRIO GATTI 2026] ${q.code} (Q#${an}) homologada`);
        }
      }
    }
  }

  // 4. PSU-MG (2020 a 2025 Alterações e Anulações)
  console.log('--- Verificando PSU-MG / AREMG ---');
  for (let yr = 2020; yr <= 2025; yr++) {
    const altPath = `data/official_exams/PSU_MG/PSU_MG_${yr}_ALTERACAO_GABARITO_DEFINITIVO.pdf`;
    if (fs.existsSync(altPath)) {
      const altTxt = await extractPdfText(altPath);
      // Extrai questões anuladas no edital da AREMG
      const anMatches = [...altTxt.matchAll(/Quest[ãa]o\s+(\d{1,3})[^\n]*?ANULADA/gi)];
      for (const m of anMatches) {
        const qNum = parseInt(m[1], 10);
        const { data: psuQs } = await supabase
          .from('questions')
          .select('id, code, year, statement, correct_answer')
          .or(`code.ilike.PSUMG-${yr}%,code.ilike.AREMG-${yr}%`)
          .or('correct_answer.is.null,correct_answer.eq.');

        for (const pq of (psuQs || [])) {
          if (pq.code.endsWith(`-${qNum}`) || pq.code.includes(`0${qNum}`)) {
            if (!staging.decisoes.some(d => d.code === pq.code)) {
              staging.decisoes.push({
                id: pq.id,
                code: pq.code,
                ano: yr,
                caderno: `PSU-MG / AREMG ${yr}`,
                qNum,
                similaridadeEnunciado: 1.0,
                similaridadeAlternativa: 1.0,
                gabaritoOficialExtraido: 'ANULADA',
                gabaritoMapeadoNoBanco: 'ANULADA',
                foiRemapeado: false,
                isAnulada: true,
                editalReferencia: `Alteração de Gabarito Definitivo PSU-MG ${yr}`,
                dataHomologacao: new Date().toISOString()
              });
              newAnnulments++;
              console.log(`  ✅ [ANULADA PSU-MG ${yr}] ${pq.code} (Q#${qNum}) homologada`);
            }
          }
        }
      }
    }
  }

  if (newAnnulments > 0) {
    staging.totalHomologados = staging.decisoes.length;
    staging.ultimaAtualizacao = new Date().toISOString();
    fs.writeFileSync(STAGING_PATH, JSON.stringify(staging, null, 2));
    console.log(`\n🎉 Total de anulações oficiais homologadas nesta rodada: ${newAnnulments}`);
    console.log(`Total acumulado em staging agora: ${staging.totalHomologados}`);
  } else {
    console.log('\nNenhuma nova anulação encontrada pendente de homologação.');
  }
}

run().catch(console.error);

