import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const ids = [
  "ded9271a-97ab-488a-8c9a-0e08b8896d5e",
  "3b7c17d5-d3be-4439-80e4-537561b52701",
  "f62aad5c-8f0d-425a-bc35-88bb4c667ea1",
  "fef708e2-be2f-4dc1-bd12-d6f7bd1b0d55"
];

async function inspect4() {
  const { data: dbQs } = await supabase
    .from('questions')
    .select('id, code, statement, options')
    .in('id', ids);

  const pdfPath = 'C:/Users/cnath/.gemini/antigravity/brain/9618f204-3788-45d2-8b60-26cb27d0dbd1/.user_uploaded/media_1794604731740_a22389df.pdf';
  const buf = new Uint8Array(fs.readFileSync(pdfPath));
  const p = new PDFParse({ data: buf });
  await p.load();
  const rawText = (await p.getText()).text || await p.getText();

  for (const q of dbQs) {
    console.log(`\n======================================`);
    console.log(`ID: ${q.id} | CODE: ${q.code}`);
    console.log(`DB STATEMENT (first 150 chars):\n${q.statement.slice(0, 150)}`);
    
    // Procura palavras chave no PDF
    const words = q.statement.split(/\s+/).slice(0, 6).join(' ');
    const pos = rawText.indexOf(words);
    if (pos !== -1) {
      console.log(`ENCONTRADO NO PDF na pos ${pos}:`);
      console.log(rawText.slice(pos - 50, pos + 250).replace(/\n/g, ' '));
    } else {
      console.log(`NÃO ENCONTRADO por match exato de "${words}". Testando busca flexível:`);
      const keyWords = ['litíase renal', '67 anos', 'indígena', 'dermatite atópica'];
      for (const kw of keyWords) {
        if (q.statement.includes(kw)) {
          const pKw = rawText.indexOf(kw);
          if (pKw !== -1) {
            console.log(`Encontrado por "${kw}":`);
            console.log(rawText.slice(pKw - 100, pKw + 200).replace(/\n/g, ' '));
          }
        }
      }
    }
  }
}

inspect4().catch(console.error);
