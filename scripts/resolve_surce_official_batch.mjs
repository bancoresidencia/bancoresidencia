import fs from 'fs';
import { PDFParse } from 'pdf-parse';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

function norm(text) {
  if (!text) return '';
  return text.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function getTokens(text) {
  return new Set(norm(text).split(' ').filter(w => w.length >= 4));
}

function parseSurceAnswerKey(text) {
  const ansMap = {};
  // Linhas com números de 01 a 20 e linhas seguintes com letras
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const tokens = line.split(/\s+/);
    if (tokens.every(t => /^\d{1,3}$/.test(t)) && tokens.length >= 5) {
      const qNums = tokens.map(t => parseInt(t, 10));
      const nextLine = lines[i + 1] || '';
      const ansTokens = nextLine.split(/\s+/).map(t => t.replace(/[*#]/g, '').toUpperCase());
      if (ansTokens.length === qNums.length) {
        for (let j = 0; j < qNums.length; j++) {
          const ans = ansTokens[j];
          ansMap[qNums[j]] = ['X', 'ANULADA', 'NULA', '-'].includes(ans) ? 'ANULADA' : ans;
        }
      }
    }
  }
  return ansMap;
}

function extractSurceBooklet(text) {
  // Provas da SURCE usam: "01.", "02.", "03." ou "QUESTÃO 01"
  const regex = /(?:^|\n)\s*(?:QUESTÃO\s+)?(\d{1,3})\s*[\.\-–\)]\s+/gi;
  const matches = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    const num = parseInt(m[1], 10);
    if (num >= 1 && num <= 120) {
      matches.push({ qNum: num, index: m.index });
    }
  }

  // Deduplica números sequenciais
  const questions = [];
  for (let i = 0; i < matches.length; i++) {
    const curr = matches[i];
    const next = matches[i + 1];
    const qText = next ? text.substring(curr.index, next.index) : text.substring(curr.index, curr.index + 2500);
    // Limpa alternativas A, B, C, D
    const cleanStmt = qText.replace(/^[^\n]+\n/, '').split(/\n\s*[A-E]\s*[\)\.\-]/)[0];
    if (cleanStmt.trim().length >= 30) {
      questions.push({
        qNum: curr.qNum,
        statement: cleanStmt.trim(),
        tokens: getTokens(cleanStmt)
      });
    }
  }
  return questions;
}

async function resolveYear(year, pvPath, gbPath) {
  console.log(`\n======================================================`);
  console.log(`🎯 PROCESSANDO SURCE ${year} (ACESSO DIRETO)`);
  console.log(`======================================================`);

  if (!fs.existsSync(pvPath) || !fs.existsSync(gbPath)) {
    console.log(`❌ Arquivos não encontrados para ${year}`);
    return 0;
  }

  // 1. Parse Gabarito
  const gbBuf = new Uint8Array(fs.readFileSync(gbPath));
  const gbParser = new PDFParse(gbBuf);
  await gbParser.load();
  const gbRes = await gbParser.getText();
  const gbText = typeof gbRes === 'string' ? gbRes : (gbRes.text || '');
  const answers = parseSurceAnswerKey(gbText);
  console.log(`  Gabarito Oficial lido: ${Object.keys(answers).length} respostas.`);

  // 2. Parse Prova
  const pvBuf = new Uint8Array(fs.readFileSync(pvPath));
  const pvParser = new PDFParse(pvBuf);
  await pvParser.load();
  const pvRes = await pvParser.getText();
  const pvText = typeof pvRes === 'string' ? pvRes : (pvRes.text || '');
  const bookletQuestions = extractSurceBooklet(pvText);
  console.log(`  Caderno Oficial lido: ${bookletQuestions.length} questões extraídas.`);

  // 3. Busca questões do Supabase para SURCE do ano
  const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?institution=ilike.*SURCE*&year=eq.${year}&select=id,statement,code,correct_answer,commentary`, {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
  });
  const dbQuestions = await res.json();
  if (!Array.isArray(dbQuestions) || dbQuestions.length === 0) {
    console.log(`  Nenhuma questão no Supabase para SURCE ${year}`);
    return 0;
  }
  console.log(`  Questões no Supabase para SURCE ${year}: ${dbQuestions.length}`);

  // 4. Casamento por Sobreposição de Tokens
  let matched = 0;
  const updates = [];

  for (const bq of bookletQuestions) {
    const ans = answers[bq.qNum];
    if (!ans) continue;

    let bestQ = null;
    let maxOverlap = 0;

    for (const dq of dbQuestions) {
      const dTokens = getTokens(dq.statement);
      if (dTokens.size === 0) continue;

      let intersection = 0;
      for (const t of bq.tokens) {
        if (dTokens.has(t)) intersection++;
      }

      const union = bq.tokens.size + dTokens.size - intersection;
      const score = intersection / union;

      if (score > maxOverlap && score >= 0.38) {
        maxOverlap = score;
        bestQ = dq;
      }
    }

    if (bestQ && maxOverlap >= 0.38) {
      matched++;
      const isAnulada = ans === 'ANULADA';
      updates.push({
        id: bestQ.id,
        qNum: bq.qNum,
        ans: isAnulada ? 'ANULADA' : ans,
        isAnulada,
        score: maxOverlap.toFixed(2),
        code: bestQ.code
      });
    }
  }

  console.log(`  ✅ Casadas com precisão: ${matched}/${bookletQuestions.length} questões!`);

  // 5. Atualiza no Supabase
  let updatedCount = 0;
  for (const u of updates) {
    const commentary = `Gabarito Oficial Homologado - SURCE ${year} (Prova Oficial Definitiva - Questão ${u.qNum})`;
    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=eq.${u.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        correct_answer: u.ans,
        commentary: commentary,
        is_anulada: u.isAnulada
      })
    });
    if (patchRes.ok) updatedCount++;
  }

  console.log(`  🚀 Gravadas no Supabase: ${updatedCount} questões homologadas com sucesso!`);
  return updatedCount;
}

async function main() {
  console.log('================================================================');
  console.log('  HOMOLOGADOR DETERMINÍSTICO DE CADERNOS OFICIAIS — SURCE CEARÁ');
  console.log('================================================================');

  let totalHomologado = 0;

  // 2022
  totalHomologado += await resolveYear(
    2022,
    'data/official_exams/SURCE/SURCE_2022_PROVA_ACESSO_DIRETO.pdf',
    'data/official_exams/SURCE/SURCE_2022_GABARITO_DEFINITIVO.pdf'
  );

  // 2024
  totalHomologado += await resolveYear(
    2024,
    'data/official_exams/SURCE/SURCE_2024_PROVA_ACESSO_DIRETO.pdf',
    'data/official_exams/SURCE/SURCE_2024_GABARITO_PRELIMINAR.pdf'
  );

  console.log(`\n🎉 TOTAL SURCE HOMOLOGADO NESTA SESSÃO: ${totalHomologado} questões!`);
}

main().catch(console.error);
