import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(dbPath);

console.log('--- DETALHAMENTO DE DOMÍNIOS E FONTES DE IMAGEM ---');

// 1. Inspecionar os 391 caminhos locais ou inválidos e os 390 api.medevo
const rowsMedevoAndInvalid = db.prepare(`
  SELECT id, statement, options, images
  FROM questions_curated_staging
  WHERE images LIKE '%medevo%' OR images NOT LIKE 'http%' AND images IS NOT NULL AND length(images) > 2
  LIMIT 15
`).all();

console.log('Amostra de imagens com medevo ou caminhos sem http:');
for (const r of rowsMedevoAndInvalid) {
  console.log(`ID: ${r.id}`);
  console.log(`  images: ${r.images}`);
}

// 2. Verificar distribuição das 709 questões com indício de imagem faltante por banca e ano
console.log('\n--- ANÁLISE DAS QUESTÕES COM IMAGENS FALTANTES NO ENUNCIADO ---');
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

const missingByBanca = {};
const missingByYear = {};
const missingBySource = {};

const allNoImg = db.prepare(`
  SELECT id, banca, year, statement, source_tables
  FROM questions_curated_staging
  WHERE images IS NULL OR images = '[]' OR images = 'null' OR images = ''
`).all();

let countMissingClues = 0;
for (const r of allNoImg) {
  let hasClue = false;
  if (r.statement) {
    for (const clue of CLINICAL_IMG_CLUES) {
      if (clue.test(r.statement)) {
        hasClue = true;
        break;
      }
    }
  }
  if (hasClue) {
    countMissingClues++;
    const b = r.banca || 'SEM BANCA';
    missingByBanca[b] = (missingByBanca[b] || 0) + 1;
    const y = r.year || 'SEM ANO';
    missingByYear[y] = (missingByYear[y] || 0) + 1;
    const s = r.source_tables || 'DESCONHECIDO';
    missingBySource[s] = (missingBySource[s] || 0) + 1;
  }
}

console.log(`Total confirmadas com indício: ${countMissingClues}`);
console.log('Top Bancas com Imagens Faltantes:', Object.entries(missingByBanca).sort((a,b) => b[1] - a[1]).slice(0, 10));
console.log('Top Anos com Imagens Faltantes:', Object.entries(missingByYear).sort((a,b) => b[1] - a[1]).slice(0, 10));
console.log('Origem das Questões com Imagens Faltantes:', Object.entries(missingBySource).sort((a,b) => b[1] - a[1]));

// 3. Inspecionar provaderesidencia_imagens_arquivo: como estão as URLs e local_path?
console.log('\n--- PROVADERESIDENCIA_IMAGENS_ARQUIVO STATUS ---');
const pdrSample = db.prepare(`
  SELECT id, questao_id, url, local_path, mime_type, length(image_blob) as blob_size
  FROM provaderesidencia_imagens_arquivo
  LIMIT 5
`).all();
console.log(JSON.stringify(pdrSample, null, 2));

// 4. Inspecionar se no enunciado das questões com imagem já existe a tag ou se a imagem está 'descolada'
console.log('\n--- ANÁLISE DE VÍNCULO DETERMINÍSTICO (IMAGENS NA TABELA VS ENUNCIADO) ---');
const countOnlyInImagesCol = db.prepare(`
  SELECT count(*) as c
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND length(images) > 4
    AND statement NOT LIKE '%http%'
    AND statement NOT LIKE '%[IMG%'
    AND statement NOT LIKE '%<img%'
    AND statement NOT LIKE '%![%'
`).get().c;
console.log(`Questões com imagens cadastradas na coluna images, mas SEM nenhuma tag visível dentro do enunciado: ${countOnlyInImagesCol}`);

// 5. Inspecionar palavras-chave suspeitas de marca d'água nas URLs existentes
console.log('\n--- ANÁLISE DE PALAVRAS-CHAVE SUSPEITAS NAS URLs DE IMAGEM ---');
const suspiciousKeywords = ['medcurso', 'medgrupo', 'estrategia', 'sanar', 'hardwork', 'medway', 'provaderesidencia', 'pdres', 'medevo', 'questmed'];
for (const kw of suspiciousKeywords) {
  const c = db.prepare(`SELECT count(*) as c FROM questions_curated_staging WHERE images LIKE ?`).get(`%${kw}%`).c;
  console.log(`Palavra-chave '${kw}': ${c} questões com ocorrência na coluna images`);
}

