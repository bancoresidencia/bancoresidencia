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
    if (qNum >= 1 && qNum <= 100) {
      matches.push({ qNum, index: m.index });
    }
  }
  const valid = [];
  let expected = 1;
  for (const item of matches) {
    if (item.qNum === expected) {
      valid.push(item);
      expected++;
    }
  }
  const questions = {};
  for (let i = 0; i < valid.length; i++) {
    const s = valid[i].index;
    const e = i + 1 < valid.length ? valid[i+1].index : bodyTxt.length;
    questions[valid[i].qNum] = bodyTxt.slice(s, e).trim();
  }
  return questions;
}

async function main() {
  console.log("================================================================================");
  console.log("HOMOLOGAÇÃO OFICIAL LOTE 2 — UERJ / HUPE (CEPUERJ 2022 a 2026)");
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
    console.log(`[UERJ ${year}] Gabarito: ${Object.keys(ansMap).length} questões | Caderno: ${Object.keys(bookletMap).length} questões`);
  }
  
  const specialtyFiles = [
    'data/clinica_medica_final_questions.json',
    'data/cirurgia_final_questions.json',
    'data/pediatria_final_questions.json',
    'data/ginecologia_final_questions.json',
    'data/medicina_preventiva_final_questions.json',
    'data/obstetricia_final_questions.json',
    'data/urologia_final_questions.json'
  ];
  
  let totalUpdated = 0;
  const questionsToSyncSupabase = [];
  
  for (const sPath of specialtyFiles) {
    if (!fs.existsSync(sPath)) continue;
    const list = JSON.parse(fs.readFileSync(sPath, 'utf-8'));
    let fileModified = false;
    
    for (const q of list) {
      const inst = q.institution || '';
      const banca = q.banca || '';
      const isUerj = inst.toLowerCase().includes('uerj') || banca.toLowerCase().includes('uerj');
      const qYear = parseInt(q.year, 10);
      
      if (isUerj && yearData[qYear]) {
        const { ansMap, bookletMap } = yearData[qYear];
        const qTokens = getTokens(q.statement);
        
        let bestNum = null;
        let bestScore = 0;
        
        for (const [numStr, bText] of Object.entries(bookletMap)) {
          const num = parseInt(numStr, 10);
          const bTokens = getTokens(bText);
          const intersection = [...qTokens].filter(t => bTokens.has(t));
          const score = intersection.length / Math.max(1, qTokens.size);
          if (score > bestScore) {
            bestScore = score;
            bestNum = num;
          }
        }
        
        if (bestScore >= 0.60 && bestNum) {
          const officialAns = ansMap[bestNum];
          const isAnul = officialAns === 'ANULADA';
          
          q.correct_answer = isAnul ? null : officialAns;
          q.correctAnswer = isAnul ? 'ANULADA' : officialAns;
          q.is_anulada = isAnul;
          q.isAnulada = isAnul;
          q.official_book = `UERJ_${qYear}_PROVA_ACESSO_DIRETO.pdf`;
          q.provenance = "oficial_uerj_cepuerj";
          q.is_official = true;
          q.commentary = `Gabarito Oficial Homologado - UERJ ${qYear} (Questão ${bestNum}${isAnul ? ' Anulada' : ''} - CEPUERJ UERJ_${qYear}_GABARITO_DEFINITIVO.pdf)`;
          
          questionsToSyncSupabase.push({
            id: q.id,
            correct_answer: isAnul ? 'ANULADA' : officialAns,
            commentary: q.commentary
          });
          
          fileModified = true;
          totalUpdated++;
          console.log(`  ✓ [UERJ ${qYear}] ${q.code || q.id.slice(0,8)} -> Q${bestNum} (${(bestScore*100).toFixed(0)}%) = ${officialAns}`);
        }
      }
    }
    
    if (fileModified) {
      fs.writeFileSync(sPath, JSON.stringify(list, null, 2), 'utf-8');
      console.log(`💾 Arquivo salvo: ${sPath}`);
    }
  }
  
  console.log(`\n🎉 Total de questões UERJ homologadas localmente: ${totalUpdated}`);
  
  // Sincronizar com Supabase se houver credenciais
  if (SUPABASE_URL && SERVICE_KEY && questionsToSyncSupabase.length > 0) {
    console.log(`\n🚀 Disparando sincronização direta de ${questionsToSyncSupabase.length} questões com Supabase...`);
    const CONCURRENCY = 20;
    let supaUpdated = 0;
    let supaErrors = 0;
    
    for (let i = 0; i < questionsToSyncSupabase.length; i += CONCURRENCY) {
      const chunk = questionsToSyncSupabase.slice(i, i + CONCURRENCY);
      await Promise.all(chunk.map(async item => {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=eq.${item.id}`, {
            method: 'PATCH',
            headers: {
              'apikey': SERVICE_KEY,
              'Authorization': `Bearer ${SERVICE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              correct_answer: item.correct_answer,
              commentary: item.commentary
            })
          });
          if (res.ok) supaUpdated++;
          else supaErrors++;
        } catch (e) {
          supaErrors++;
        }
      }));
    }
    console.log(`✅ Supabase atualizado: ${supaUpdated} com sucesso, ${supaErrors} erros.`);
  }
}

main().catch(console.error);
