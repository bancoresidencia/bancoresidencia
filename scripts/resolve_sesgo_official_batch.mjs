import fs from 'fs';
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

function parseSesgoAnswerKey(text) {
  const ansMap = {};
  const clean = text.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, '')
                    .replace(/Goiânia[\s\S]*$/gi, '')
                    .replace(/\* - Gabarito alterado[\s\S]*$/gi, '');
  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const tokens = line.split(/\s+/);
    if (tokens.every(t => /^\d{1,3}$/.test(t)) && tokens.length >= 4) {
      const qNums = tokens.map(t => parseInt(t, 10));
      const nextLine = lines[i + 1] || '';
      const ansTokens = nextLine.split(/\s+/).map(t => t.replace(/[*#]/g, '').toUpperCase());
      if (ansTokens.length === qNums.length) {
        for (let j = 0; j < qNums.length; j++) {
          const ans = ansTokens[j];
          ansMap[qNums[j]] = ans === 'X' ? 'ANULADA' : ans;
        }
      }
    }
  }
  return ansMap;
}

function extractSesgoBooklet(text) {
  const regex = /(?:^|\n)\s*(?:QUESTÃO|QUESTAO)\s+(\d{1,3})/gi;
  const matches = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    matches.push({ qNum: parseInt(m[1], 10), index: m.index });
  }
  const questions = {};
  for (let i = 0; i < matches.length; i++) {
    const s = matches[i].index;
    const e = i + 1 < matches.length ? matches[i+1].index : text.length;
    questions[matches[i].qNum] = text.slice(s, e).trim();
  }
  return questions;
}

async function main() {
  console.log("================================================================================");
  console.log("HOMOLOGAÇÃO OFICIAL LOTE 2 — SES-GO (INSTITUTO VERBENA UFG 2023 a 2026)");
  console.log("================================================================================");

  const years = [2026, 2024, 2023];
  const yearData = {};

  for (const year of years) {
    const gbBuf = new Uint8Array(fs.readFileSync(`data/official_exams/SES_GO/SES_GO_${year}_GABARITO_DEFINITIVO.pdf`));
    const pGb = new PDFParse(gbBuf);
    await pGb.load();
    const gbTxt = (await pGb.getText()).text || await pGb.getText();
    const ansMap = parseSesgoAnswerKey(gbTxt);

    const pvBuf = new Uint8Array(fs.readFileSync(`data/official_exams/SES_GO/SES_GO_${year}_PROVA_ACESSO_DIRETO.pdf`));
    const pPv = new PDFParse(pvBuf);
    await pPv.load();
    const pvTxt = (await pPv.getText()).text || await pPv.getText();
    const bookletMap = extractSesgoBooklet(pvTxt);

    yearData[year] = { ansMap, bookletMap };
    console.log(`[SES-GO ${year}] Gabarito: ${Object.keys(ansMap).length} questões | Caderno: ${Object.keys(bookletMap).length} questões`);
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
      const isSesgo = inst.toLowerCase().includes('ses-go') || banca.toLowerCase().includes('ses-go') || inst.toLowerCase().includes('saúde de goiás');
      const qYear = parseInt(q.year, 10);

      if (isSesgo && yearData[qYear]) {
        const { ansMap, bookletMap } = yearData[qYear];
        const qToks = getTokens(q.statement);

        let bestNum = null;
        let bestScore = 0;

        for (const [numStr, bText] of Object.entries(bookletMap)) {
          const num = parseInt(numStr, 10);
          const bToks = getTokens(bText);
          const inter = [...qToks].filter(t => bToks.has(t)).length;
          const score = inter / Math.max(1, qToks.size);
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
          q.official_book = `SES_GO_${qYear}_PROVA_ACESSO_DIRETO.pdf`;
          q.provenance = "oficial_sesgo_verbena";
          q.is_official = true;
          q.commentary = `Gabarito Oficial Homologado - SES-GO ${qYear} (Questão ${bestNum}${isAnul ? ' Anulada' : ''} - Instituto Verbena SES_GO_${qYear}_GABARITO_DEFINITIVO.pdf)`;

          questionsToSyncSupabase.push({
            id: q.id,
            correct_answer: isAnul ? 'ANULADA' : officialAns,
            commentary: q.commentary
          });

          fileModified = true;
          totalUpdated++;
          console.log(`  ✓ [SES-GO ${qYear}] ${q.code || q.id.slice(0,8)} -> Q${bestNum} (${(bestScore*100).toFixed(0)}%) = ${officialAns}`);
        }
      }
    }

    if (fileModified) {
      fs.writeFileSync(sPath, JSON.stringify(list, null, 2), 'utf-8');
      console.log(`💾 Arquivo salvo: ${sPath}`);
    }
  }

  console.log(`\n🎉 Total de questões SES-GO homologadas localmente: ${totalUpdated}`);

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

  // Appending to gold
  const goldPath = 'data/all_homologated_questions_gold.json';
  if (fs.existsSync(goldPath)) {
    const gold = JSON.parse(fs.readFileSync(goldPath, 'utf-8'));
    const seenGold = new Set(gold.map(x => x.id));
    let addedGold = 0;
    for (const item of questionsToSyncSupabase) {
      if (!seenGold.has(item.id)) {
        gold.push({
          id: item.id,
          correct_answer: item.correct_answer === 'ANULADA' ? null : item.correct_answer,
          is_anulada: item.correct_answer === 'ANULADA',
          commentary: item.commentary,
          provenance: "oficial_sesgo_verbena",
          is_official: true
        });
        seenGold.add(item.id);
        addedGold++;
      }
    }
    fs.writeFileSync(goldPath, JSON.stringify(gold, null, 2), 'utf-8');
    console.log(`✨ Adicionadas ${addedGold} questões de SES-GO ao Manifesto de Ouro! Total agora: ${gold.length}`);
  }
}

main().catch(console.error);
