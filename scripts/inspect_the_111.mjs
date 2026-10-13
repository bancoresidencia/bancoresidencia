import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const BASE_DIR = process.cwd();

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function normHash(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 90);
}

async function main() {
  const baseExtracao = path.join(BASE_DIR, 'data', 'knowledge', 'extracao_de_questoes');
  const the111 = [];

  for (const spec of fs.readdirSync(baseExtracao)) {
    const specDir = path.join(baseExtracao, spec);
    if (!fs.statSync(specDir).isDirectory()) continue;
    for (const f of fs.readdirSync(specDir)) {
      if (!f.endsWith('.json')) continue;
      const data = JSON.parse(fs.readFileSync(path.join(specDir, f), 'utf8'));
      (data.questoes || []).forEach(q => {
        if ((!q.gabarito || !q.gabarito.trim()) && q.presenteNaPlataforma) {
          the111.push({
            especialidade: spec,
            tema: q.tema,
            banca: q.banca,
            texto: q.texto,
            hash: normHash(q.texto)
          });
        }
      });
    }
  }

  console.log(`Carregadas as ${the111.length} questões.`);
  
  // Vamos buscar cada uma no Supabase por texto aproximado / ilike
  let matched = 0;
  const matches = [];

  for (let i = 0; i < the111.length; i++) {
    const item = the111[i];
    // Pega as primeiras palavras significativas do enunciado (pulando "Questão X — ")
    const cleanText = item.texto.replace(/^Quest[aã]o\s+\d+\s*[-—]\s*\d*\s*[^,]+,\s*Selecionada\s*/i, '').trim();
    const searchSnippet = cleanText.slice(0, 50).replace(/[%_]/g, '');

    if (searchSnippet.length < 15) continue;

    const { data: supaQs } = await supabase
      .from('questions')
      .select('id, statement, banca, year, correct_answer')
      .ilike('statement', `%${searchSnippet}%`)
      .limit(2);

    if (supaQs && supaQs.length > 0) {
      matched++;
      matches.push({
        supaId: supaQs[0].id,
        supaBanca: supaQs[0].banca,
        supaYear: supaQs[0].year,
        currentCorrectAnswer: supaQs[0].correct_answer,
        snippet: searchSnippet
      });
    }
  }

  console.log(`\nCorrespondências diretas no Supabase: ${matched}/${the111.length}`);
  console.log('Exemplos de correspondências encontradas:');
  console.log(JSON.stringify(matches.slice(0, 5), null, 2));
}

main().catch(console.error);
