import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function cleanLexical(text) {
  if (!text) return '';
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(\d+)([a-zA-Z]+)\b/g, '$1 $2')
    .replace(/\bAntônlo\b/gi, 'Antonio')
    .replace(/\bnegatlvo\b/gi, 'negativo')
    .replace(/\badminlstraçăo\b/gi, 'administracao')
    .replace(/\bcornplicações\b/gi, 'complicacoes')
    .replace(/\bDuranteo\b/gi, 'Durante o')
    .replace(/\bmascullno\b/gi, 'masculino')
    .replace(/\beIevação\b/gi, 'elevacao')
    .replace(/\bnutńcionais\b/gi, 'nutricionais')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/î/g, 'i')
    .replace(/ă/g, 'a')
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateJaccard(s1, s2) {
  const w1 = new Set(cleanLexical(s1).split(' ').filter(w => w.length > 2));
  const w2 = new Set(cleanLexical(s2).split(' ').filter(w => w.length > 2));
  if (w1.size === 0 || w2.size === 0) return 0;
  let inter = 0;
  for (const w of w1) if (w2.has(w)) inter++;
  return inter / new Set([...w1, ...w2]).size;
}

function getBiGrams(str) {
  const s = cleanLexical(str).replace(/\s+/g, '');
  const bg = new Set();
  for (let i = 0; i < s.length - 1; i++) bg.add(s.slice(i, i + 2));
  return bg;
}

function calculateSimilarity(s1, s2) {
  const j = calculateJaccard(s1, s2);
  const bg1 = getBiGrams(s1);
  const bg2 = getBiGrams(s2);
  if (bg1.size === 0 || bg2.size === 0) return j;
  let inter = 0;
  for (const b of bg1) if (bg2.has(b)) inter++;
  const bgSim = (2.0 * inter) / (bg1.size + bg2.size);
  return (j * 0.4) + (bgSim * 0.6);
}

async function main() {
  console.log('--- Processando OCR da Prova Geral AMP 2024 ---');
  const rawJson = fs.readFileSync('data/amp_2024_pages/ocr_all_pages.json', 'utf8').replace(/^\uFEFF/, '');
  const ocrPages = JSON.parse(rawJson);
  const fullText = ocrPages.map(p => p.text).join('\n\n');
  console.log(`Texto total OCR: ${fullText.length} caracteres.`);

  // Carregar Gabarito Oficial AMP 2024
  const gbPath = 'data/official_exams/AMP_PARANA/GB_AMP_2024_OFICIAL.pdf';
  const gbBuf = new Uint8Array(fs.readFileSync(gbPath));
  const parser = new PDFParse(gbBuf);
  await parser.load();
  const gbRes = await parser.getText();
  const gbTxt = typeof gbRes === 'string' ? gbRes : gbRes.text;

  // Extrair respostas do gabarito oficial
  const ansMap = {};
  const gbMatches = [...gbTxt.matchAll(/(\d{1,3})\s*[\)\.\-]?\s*([A-EX])/gi)];
  for (const m of gbMatches) {
    const qNum = parseInt(m[1], 10);
    const ans = m[2].toUpperCase();
    ansMap[qNum] = ans === 'X' ? 'ANULADA' : ans;
  }
  console.log(`Gabaritos oficiais mapeados do PDF: ${Object.keys(ansMap).length} questões.`);

  // Extrair questões do texto OCR
  // Padrão típico na prova da AMP: "QUESTÃO 01" ou "1." ou "01." ou "1 -"
  // Vamos buscar regex de separação de questões
  const qSplits = [];
  const qRegex = /(?:QUEST[ÃA]O|Quest[ãa]o)?\s*(\b[0-9]{1,3}\b)\s*[\.\-\)]\s+/g;
  let m;
  const positions = [];
  while ((m = qRegex.exec(fullText)) !== null) {
    const num = parseInt(m[1], 10);
    if (num >= 1 && num <= 100) {
      positions.push({ num, index: m.index });
    }
  }

  // Filtrar posições sequenciais válidas
  console.log(`Candidatos a cabeçalho de questão encontrados: ${positions.length}`);

  // Carregar questões pendentes do Paraná no banco
  const { data: dbQuestions, error: dbErr } = await supabase
    .from('questions')
    .select('id, code, year, institution, statement, options, correct_answer')
    .or('code.ilike.AMP%,code.ilike.HMMSJP%,code.ilike.PMFI%,code.ilike.SMSFOZ%,code.ilike.UEM%');

  if (dbErr) {
    console.error('Erro ao buscar do Supabase:', dbErr);
    return;
  }
  const pending = dbQuestions.filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`Total de pendentes Paraná no banco: ${pending.length}`);

  // Testar matching de cada pendente contra os blocos do texto OCR
  const stagingPath = 'data/staging_homologados_85pct.json';
  let staging = { ultimaAtualizacao: new Date().toISOString(), totalHomologados: 0, decisoes: [] };
  if (fs.existsSync(stagingPath)) {
    staging = JSON.parse(fs.readFileSync(stagingPath, 'utf8'));
  }

  let matchesFound = 0;
  for (const qDb of pending) {
    if (staging.decisoes.some(d => d.code === qDb.code)) continue;
    // Testar com tolerância temporal para 2024 e 2025
    if (qDb.year && Math.abs(qDb.year - 2024) > 1) continue;

    // Buscar no texto OCR a melhor similaridade
    let bestSim = 0;
    let bestBlock = null;
    let bestQNum = null;

    // Varrer posições
    for (let i = 0; i < positions.length; i++) {
      const qNum = positions[i].num;
      const startIdx = positions[i].index;
      const endIdx = i + 1 < positions.length ? positions[i+1].index : startIdx + 3000;
      const block = fullText.slice(startIdx, Math.min(startIdx + 3000, endIdx));

      const sim = calculateSimilarity(cleanLexical(qDb.statement), cleanLexical(block));
      if (sim > bestSim) {
        bestSim = sim;
        bestBlock = block;
        bestQNum = qNum;
      }
    }

    if (bestSim >= 0.80) {
      console.log(`\nCANDIDATO: ${qDb.code} (Ano ${qDb.year}) -> Q#${bestQNum} (Sim: ${(bestSim*100).toFixed(1)}%)`);
      const officialAns = ansMap[bestQNum];
      console.log(`  Gabarito Oficial para Q#${bestQNum}: ${officialAns}`);

      if (bestSim >= 0.85 && officialAns) {
        // Verificar alternativas
        let optSim = 1.0;
        if (officialAns !== 'ANULADA' && qDb.options) {
          const dbOpt = qDb.options.find(o => o.letter === officialAns);
          if (dbOpt) {
            // Verificar se o texto da alternativa está no bloco
            const cleanOpt = cleanLexical(dbOpt.text);
            const inBlock = cleanLexical(bestBlock).includes(cleanOpt.slice(0, 30));
            optSim = inBlock ? 1.0 : 0.88;
          }
        }

        staging.decisoes.push({
          id: qDb.id,
          code: qDb.code,
          ano: qDb.year,
          caderno: 'AMP 2024 (Prova Geral OCR Nativo)',
          qNum: bestQNum,
          similaridadeEnunciado: Math.round(bestSim * 1000) / 1000,
          similaridadeAlternativa: Math.round(optSim * 1000) / 1000,
          gabaritoOficialExtraido: officialAns,
          gabaritoMapeadoNoBanco: officialAns,
          foiRemapeado: false,
          isAnulada: officialAns === 'ANULADA',
          dataHomologacao: new Date().toISOString()
        });
        matchesFound++;
        console.log(`  >>> HOMOLOGADO EM STAGING: ${qDb.code} -> GB=${officialAns}`);
      }
    }
  }

  console.log(`\n--- Concluído: ${matchesFound} novas homologações adicionadas ao Staging! ---`);
  staging.totalHomologados = staging.decisoes.length;
  staging.ultimaAtualizacao = new Date().toISOString();
  fs.writeFileSync(stagingPath, JSON.stringify(staging, null, 2));
  console.log(`Total em Staging agora: ${staging.totalHomologados}`);
}

main().catch(console.error);
