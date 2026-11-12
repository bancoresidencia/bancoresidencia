import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(dbPath);

const CLINICAL_IMG_CLUES = [
  /observe\s+(?:a\s+)?(?:imagem|figura|foto|radiografia|tomografia|ilustra[çc][ãa]o)/i,
  /conforme\s+(?:a\s+)?(?:imagem|figura|foto|radiografia|tomografia|ilustra[çc][ãa]o)/i,
  /(?:imagem|figura|foto|radiografia|tomografia|eletrocardiograma|ecg|tc|rm|rx)\s+(?:abaixo|a\s+seguir|acima|mostrad[ao]|anex[ao]|ilustrad[ao])/i,
  /(?:abaixo|a\s+seguir|anex[ao])\s+(?:est[áa]|encontra-se|demonstrad[ao]|ilustrad[ao])\s+(?:o\s+)?(?:eletrocardiograma|ecg|radiografia|imagem|figura|tc|exame)/i,
  /(?:ilustrad[ao]|demonstrad[ao]|apresentad[ao]|reproduzid[ao])\s+(?:a\s+seguir|abaixo)/i,
  /basead[ao]\s+na\s+(?:imagem|figura|foto|radiografia)/i,
  /analise\s+(?:a\s+)?(?:imagem|figura|foto|radiografia|o\s+eletrocardiograma)/i,
  /veja\s+(?:a\s+)?(?:imagem|figura|foto)/i,
  /de\s+acordo\s+com\s+(?:a\s+)?(?:imagem|figura|foto)/i,
  /laudo\s+da\s+(?:tomografia|radiografia|resson[âa]ncia)\s+(?:abaixo|anex[ao])/i,
  /aspecto\s+(?:da\s+les[ãa]o|macrosc[óo]pico|microsc[óo]pico|tomogr[áa]fico|radiogr[áa]fico)\s+(?:abaixo|a\s+seguir|na\s+foto)/i,
  /quadro\s+cl[íi]nico\s+e\s+(?:a\s+)?(?:imagem|figura|foto)/i,
  /\bfigura\s+[1-9]\b/i,
  /\bimagem\s+[1-9]\b/i
];

const allNoImg = db.prepare(`
  SELECT id, banca, year, statement
  FROM questions_curated_staging
  WHERE images IS NULL OR images = '[]' OR images = 'null' OR images = ''
`).all();

const specificTypes = {
  ecg: 0,
  rx: 0,
  tc: 0,
  rm: 0,
  foto_clinica_dermato: 0,
  tabela_grafico: 0,
  imagem_generica: 0
};

for (const r of allNoImg) {
  if (!r.statement) continue;
  let matched = false;
  for (const clue of CLINICAL_IMG_CLUES) {
    if (clue.test(r.statement)) {
      matched = true;
      break;
    }
  }
  if (matched) {
    const s = r.statement.toLowerCase();
    if (/ecg|eletrocardiograma/i.test(s)) specificTypes.ecg++;
    else if (/radiografia|raio[\s-]x|rx\b/i.test(s)) specificTypes.rx++;
    else if (/tomografia|\btc\b/i.test(s)) specificTypes.tc++;
    else if (/resson[âa]ncia|\brm\b/i.test(s)) specificTypes.rm++;
    else if (/les[ãa]o|foto|aspecto\s+cl[íi]nico|pele|dermatoscop/i.test(s)) specificTypes.foto_clinica_dermato++;
    else if (/gr[áa]fico|curva|tabela/i.test(s)) specificTypes.tabela_grafico++;
    else specificTypes.imagem_generica++;
  }
}

console.log('Tipologia das 710 questões com indício real de imagem faltante:');
console.log(specificTypes);
