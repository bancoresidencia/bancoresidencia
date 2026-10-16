import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';

// Load Supabase env
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

function parseUerjAnswerKey(text) {
  const ansMap = {};
  const clean = text.replace(/UNIVERSIDADE[\s\S]*$/i, '')
                    .replace(/Legenda[\s\S]*$/i, '')
                    .replace(/ACESSO DIRETO[\s\S]*$/i, '')
                    .replace(/PROGRAMAS DO ACESSO DIRETO[\s\S]*$/i, '');
  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const rMatches = line.match(/\bR(\d+)\b/g);
    if (rMatches && rMatches.length >= 5) {
      const qNums = rMatches.map(m => parseInt(m.replace('R', ''), 10));
      let answers = (lines[i + 1] || '').split(/\s+/).filter(t => /^[A-DX]$/i.test(t));
      if (answers.length === qNums.length) {
        for (let j = 0; j < qNums.length; j++) {
          const ans = answers[j].toUpperCase();
          ansMap[qNums[j]] = ans === 'X' ? 'ANULADA' : ans;
        }
      }
    }
  }
  return ansMap;
}

function extractBookletQuestions(text) {
  const startIdx = text.search(/CLÍNICA MÉDICA|1\)\s+[A-Z]/i);
  const bodyTxt = startIdx !== -1 ? text.slice(startIdx) : text;
  const regex = /(?:^|\n)\s*(\d{1,3})\s*[\)\.]\s+/g;
  const matches = [];
  let m;
  while ((m = regex.exec(bodyTxt)) !== null) {
    const qNum = parseInt(m[1], 10);
    matches.push({ qNum, index: m.index });
  }
  
  const valid = [];
  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    if (valid.length === 0) {
      if (cur.qNum === 1) valid.push(cur);
    } else {
      const last = valid[valid.length - 1];
      if (cur.qNum === last.qNum + 1) {
        valid.push(cur);
      }
    }
  }
  
  const questions = {};
  for (let i = 0; i < valid.length; i++) {
    const s = valid[i].index;
    const e = i + 1 < valid.length ? valid[i + 1].index : bodyTxt.length;
    questions[valid[i].qNum] = bodyTxt.slice(s, e).trim();
  }
  return questions;
}

async function fetchAllUerjQuestionsFromSupabase() {
  const instName = 'UERJ/HUPE - Hospital Universitário Pedro Ernesto (RJ)';
  let all = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const offset = page * pageSize;
    const url = `${SUPABASE_URL}/rest/v1/questions?institution=eq.${encodeURIComponent(instName)}&select=id,year,especialidade,statement,options,correct_answer,commentary&limit=${pageSize}&offset=${offset}`;
    const res = await fetch(url, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`
      }
    });
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    all = all.concat(batch);
    if (batch.length < pageSize) break;
    page++;
  }
  return all;
}

async function main() {
  console.log("================================================================================");
  console.log("HOMOLOGAÇÃO INTEGRAL LOTE 2 — UERJ / HUPE (TODAS AS ESPECIALIDADES 2022 A 2026)");
  console.log("================================================================================");

  const years = [2026, 2025, 2024, 2023, 2022];
  const yearData = {};

  for (const year of years) {
    const gbBuf = new Uint8Array(fs.readFileSync(`data/official_exams/UERJ/UERJ_${year}_GABARITO_DEFINITIVO.pdf`));
    const pGb = new PDFParse(gbBuf);
    await pGb.load();
    const gbTxt = (await pGb.getText()).text || await pGb.getText();
    const ansMap = parseUerjAnswerKey(gbTxt);

    const pvBuf = new Uint8Array(fs.readFileSync(`data/official_exams/UERJ/UERJ_${year}_PROVA_ACESSO_DIRETO.pdf`));
    const pPv = new PDFParse(pvBuf);
    await pPv.load();
    const pvTxt = (await pPv.getText()).text || await pPv.getText();
    const bookletMap = extractBookletQuestions(pvTxt);

    yearData[year] = { ansMap, bookletMap };
    console.log(`[UERJ ${year}] Gabarito Definitivo: ${Object.keys(ansMap).length}/100 | Caderno: ${Object.keys(bookletMap).length}/100`);
  }

  console.log("\nBuscando todas as questões da UERJ no Supabase (todas as especialidades)...");
  const supabaseQuestions = await fetchAllUerjQuestionsFromSupabase();
  console.log(`Total de questões da UERJ no Supabase: ${supabaseQuestions.length}`);

  const specStats = {};
  supabaseQuestions.forEach(q => {
    specStats[q.especialidade || 'Indefinida'] = (specStats[q.especialidade || 'Indefinida'] || 0) + 1;
  });
  console.log("Distribuição por Especialidade:", specStats);

  let matchCount = 0;
  let alreadyOfficialCount = 0;
  const updatesToSync = [];

  for (const q of supabaseQuestions) {
    const qYear = parseInt(q.year, 10);
    if (!yearData[qYear]) continue;

    const { ansMap, bookletMap } = yearData[qYear];
    const qTokens = getTokens(q.statement);
    if (qTokens.size < 3) continue;

    let bestNum = null;
    let bestScore = 0;

    for (const [numStr, bText] of Object.entries(bookletMap)) {
      const bTokens = getTokens(bText);
      let common = 0;
      for (const t of qTokens) {
        if (bTokens.has(t)) common++;
      }
      const score = common / Math.max(qTokens.size, 1);
      if (score > bestScore) {
        bestScore = score;
        bestNum = parseInt(numStr, 10);
      }
    }

    if (bestScore >= 0.40 && bestNum && ansMap[bestNum]) {
      const officialAns = ansMap[bestNum];
      const commentary = `Gabarito Oficial Homologado - UERJ ${qYear} (UERJ_${qYear}_GABARITO_DEFINITIVO.pdf / Prova Oficial Definitiva - Questão ${bestNum})`;
      
      const isAlreadyOfficial = q.correct_answer === officialAns && q.commentary && q.commentary.includes('Gabarito Oficial Homologado');
      if (isAlreadyOfficial) {
        alreadyOfficialCount++;
      } else {
        matchCount++;
        updatesToSync.push({
          id: q.id,
          year: qYear,
          bestNum,
          bestScore,
          especialidade: q.especialidade,
          correct_answer: officialAns,
          is_anulada: officialAns === 'ANULADA',
          commentary
        });
      }
    }
  }

  console.log(`\nResultado da conferência oficial de TODAS as especialidades UERJ:`);
  console.log(` - Já homologadas anteriormente: ${alreadyOfficialCount}`);
  console.log(` - Novas questões para homologar e sincronizar: ${matchCount}`);

  if (updatesToSync.length > 0) {
    console.log(`\nSincronizando ${updatesToSync.length} novas questões com Supabase...`);
    let synced = 0;
    let errCount = 0;

    // Batch in chunks of 15
    for (let i = 0; i < updatesToSync.length; i += 15) {
      const chunk = updatesToSync.slice(i, i + 15);
      await Promise.all(chunk.map(async (item) => {
        const patchBody = {
          correct_answer: item.correct_answer,
          is_anulada: item.is_anulada,
          commentary: item.commentary
        };
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=eq.${item.id}`, {
            method: 'PATCH',
            headers: {
              apikey: SERVICE_KEY,
              Authorization: `Bearer ${SERVICE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal'
            },
            body: JSON.stringify(patchBody)
          });
          if (res.ok) {
            synced++;
          } else {
            errCount++;
            console.error(`Erro PATCH ${item.id}:`, res.status);
          }
        } catch (e) {
          errCount++;
          console.error(`Erro conexão ${item.id}:`, e.message);
        }
      }));
    }
    console.log(`✅ Sincronização concluída: ${synced} atualizadas com sucesso, ${errCount} erros.`);
  }

  console.log(`\nTotal homologado oficial para UERJ (todas as áreas): ${alreadyOfficialCount + updatesToSync.length} questões!`);
}

main().catch(console.error);
