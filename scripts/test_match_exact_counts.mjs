import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'knowledge', 'extracao_ajudamedico');

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
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
function getPrefix(text, len = 120) {
  return norm(text).substring(0, len);
}
function getTokens(text) {
  return new Set(norm(text).split(' ').filter(w => w.length >= 4));
}
function jaccard(setA, setB) {
  if (!setA || !setB || setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const elem of setA) {
    if (setB.has(elem)) intersection++;
  }
  return intersection / (setA.size + setB.size - intersection);
}

async function run() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  const ajudaQuestions = [];
  for (const f of files) {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
      if (Array.isArray(content)) ajudaQuestions.push(...content);
    } catch {}
  }
  console.log('Ajuda questions loaded:', ajudaQuestions.length);

  const supaQuestions = [];
  for (let offset = 0; offset < 10000; offset += 1000) {
    const url = `${SUPABASE_URL}/rest/v1/questions?year=gte.2024&select=id,code,institution,banca,year,statement,options,correct_answer,is_anulada&order=id&limit=1000&offset=${offset}`;
    const res = await fetch(url, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
    });
    const d = await res.json();
    if (!d || d.length === 0) break;
    supaQuestions.push(...d);
  }
  console.log('Supa questions loaded:', supaQuestions.length);

  const supaPrefix120 = new Map();
  const supaPrefix70 = new Map();
  const supaList = [];

  for (const sq of supaQuestions) {
    const p120 = getPrefix(sq.statement, 120);
    const p70 = getPrefix(sq.statement, 70);
    const hasGab = sq.correct_answer && String(sq.correct_answer).trim().length > 0;
    const gabVal = hasGab ? String(sq.correct_answer).trim().toUpperCase() : null;

    const item = {
      id: sq.id,
      code: sq.code,
      institution: sq.institution,
      banca: sq.banca,
      year: sq.year,
      statement: sq.statement,
      options: sq.options,
      hasGabarito: hasGab,
      gabarito: gabVal,
      isAnulada: sq.is_anulada,
      statementPrefix: p120,
      tokens: getTokens(sq.statement)
    };

    if (p120.length >= 40 && !supaPrefix120.has(p120)) {
      supaPrefix120.set(p120, item);
    }
    if (p70.length >= 30 && !supaPrefix70.has(p70)) {
      supaPrefix70.set(p70, item);
    }
    supaList.push(item);
  }

  let matchTotal = 0;
  let matchComGabarito = 0;
  let matchSemGabarito = 0;
  let gabaritoConcordante = 0;
  let gabaritoDivergente = 0;

  for (const aj of ajudaQuestions) {
    const p120 = getPrefix(aj.statement, 120);
    const p70 = getPrefix(aj.statement, 70);
    let match = supaPrefix120.get(p120) || supaPrefix70.get(p70);

    if (!match && aj.statement && aj.statement.length > 80) {
      const ajTokens = getTokens(aj.statement);
      if (ajTokens.size >= 8) {
        const candList = aj.year ? supaList.filter(s => s.year === aj.year) : supaList;
        for (const cand of candList) {
          if (jaccard(ajTokens, cand.tokens) >= 0.85) {
            match = cand;
            break;
          }
        }
      }
    }

    if (match) {
      matchTotal++;
      if (match.hasGabarito) {
        matchComGabarito++;
        if (match.gabarito === aj.officialAnswer) {
          gabaritoConcordante++;
        } else {
          gabaritoDivergente++;
        }
      } else {
        matchSemGabarito++;
      }
    }
  }

  console.log('Resultados:', {
    matchTotal,
    matchComGabarito,
    gabaritoConcordante,
    gabaritoDivergente,
    matchSemGabarito
  });
}
run();
