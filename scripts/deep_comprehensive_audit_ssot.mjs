import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(dbPath, { readOnly: true });

console.log('--- INICIANDO AUDITORIA EXAUSTIVA DA SSOT (questions_curated_staging) ---');

// 1. TOTAIS E COLUNAS
const pragma = db.prepare('PRAGMA table_info(questions_curated_staging)').all();
const total = db.prepare('SELECT COUNT(*) as c FROM questions_curated_staging').get().c;

console.log(`Total Geral na SSOT: ${total}`);
console.log(`Colunas (${pragma.length}): ${pragma.map(p => p.name).join(', ')}`);

// 2. CURATION STATUS & ORIGEM
const curationDist = db.prepare('SELECT curation_status, COUNT(*) as c, ROUND(COUNT(*)*100.0/? , 2) as pct FROM questions_curated_staging GROUP BY curation_status').all(total);
const sourceTablesDist = db.prepare('SELECT source_tables, COUNT(*) as c FROM questions_curated_staging GROUP BY source_tables ORDER BY c DESC LIMIT 15').all();
const mergedCount = db.prepare("SELECT COUNT(*) as c FROM questions_curated_staging WHERE merged_from_ids IS NOT NULL AND merged_from_ids != '[]' AND merged_from_ids != ''").get().c;

// 3. TAXONOMIA: ESPECIALIDADE, TEMA, FOCO, SUBFOCO
const espDist = db.prepare('SELECT especialidade, COUNT(*) as c, ROUND(COUNT(*)*100.0/? , 2) as pct FROM questions_curated_staging GROUP BY especialidade ORDER BY c DESC').all(total);
const temaTotal = db.prepare("SELECT COUNT(DISTINCT tema) as c FROM questions_curated_staging WHERE tema IS NOT NULL AND tema != ''").get().c;
const temaNull = db.prepare("SELECT COUNT(*) as c FROM questions_curated_staging WHERE tema IS NULL OR tema = ''").get().c;
const topTemas = db.prepare("SELECT tema, especialidade, COUNT(*) as c FROM questions_curated_staging WHERE tema IS NOT NULL AND tema != '' GROUP BY tema, especialidade ORDER BY c DESC LIMIT 15").all();

const focoTotal = db.prepare("SELECT COUNT(DISTINCT foco) as c FROM questions_curated_staging WHERE foco IS NOT NULL AND foco != ''").get().c;
const focoNull = db.prepare("SELECT COUNT(*) as c FROM questions_curated_staging WHERE foco IS NULL OR foco = ''").get().c;

const subfocoTotal = db.prepare("SELECT COUNT(DISTINCT subfoco) as c FROM questions_curated_staging WHERE subfoco IS NOT NULL AND subfoco != ''").get().c;
const subfocoNull = db.prepare("SELECT COUNT(*) as c FROM questions_curated_staging WHERE subfoco IS NULL OR subfoco = ''").get().c;

// 4. INSTITUIÇÃO E BANCA
const instTotal = db.prepare("SELECT COUNT(DISTINCT institution) as c FROM questions_curated_staging WHERE institution IS NOT NULL AND institution != ''").get().c;
const instNull = db.prepare("SELECT COUNT(*) as c FROM questions_curated_staging WHERE institution IS NULL OR institution = ''").get().c;
const topInst = db.prepare('SELECT institution, COUNT(*) as c, ROUND(COUNT(*)*100.0/?, 2) as pct FROM questions_curated_staging GROUP BY institution ORDER BY c DESC LIMIT 20').all(total);

const bancaTotal = db.prepare("SELECT COUNT(DISTINCT banca) as c FROM questions_curated_staging WHERE banca IS NOT NULL AND banca != ''").get().c;
const bancaNull = db.prepare("SELECT COUNT(*) as c FROM questions_curated_staging WHERE banca IS NULL OR banca = ''").get().c;
const topBancas = db.prepare('SELECT banca, COUNT(*) as c, ROUND(COUNT(*)*100.0/?, 2) as pct FROM questions_curated_staging GROUP BY banca ORDER BY c DESC LIMIT 20').all(total);

// 5. ANO (YEAR)
const yearNull = db.prepare("SELECT COUNT(*) as c FROM questions_curated_staging WHERE year IS NULL OR year = ''").get().c;
const yearRange = db.prepare('SELECT MIN(CAST(year as INTEGER)) as min_y, MAX(CAST(year as INTEGER)) as max_y FROM questions_curated_staging WHERE CAST(year as INTEGER) > 1950').get();
const yearDist = db.prepare('SELECT year, COUNT(*) as c FROM questions_curated_staging GROUP BY year ORDER BY CAST(year as INTEGER) DESC LIMIT 25').all();

// 6. MODALIDADE
const modDist = db.prepare('SELECT modalidade, COUNT(*) as c, ROUND(COUNT(*)*100.0/?, 2) as pct FROM questions_curated_staging GROUP BY modalidade ORDER BY c DESC').all(total);

// 7. DIFICULDADE (DIFFICULTY)
const diffDist = db.prepare('SELECT difficulty, COUNT(*) as c, ROUND(COUNT(*)*100.0/?, 2) as pct FROM questions_curated_staging GROUP BY difficulty ORDER BY c DESC').all(total);
const diffNull = db.prepare("SELECT COUNT(*) as c FROM questions_curated_staging WHERE difficulty IS NULL OR difficulty = ''").get().c;

// 8. TIPO DE QUESTÃO (TYPE)
const typeDist = db.prepare('SELECT type, COUNT(*) as c, ROUND(COUNT(*)*100.0/?, 2) as pct FROM questions_curated_staging GROUP BY type ORDER BY c DESC').all(total);
const typeNull = db.prepare("SELECT COUNT(*) as c FROM questions_curated_staging WHERE type IS NULL OR type = ''").get().c;

// 9. GABARITO E ANULAÇÕES
const correctAnsNull = db.prepare("SELECT COUNT(*) as c FROM questions_curated_staging WHERE correct_answer IS NULL OR TRIM(correct_answer) = ''").get().c;
const correctAnsDist = db.prepare('SELECT correct_answer, COUNT(*) as c FROM questions_curated_staging GROUP BY correct_answer ORDER BY c DESC LIMIT 15').all();
const anuladasCount = db.prepare("SELECT COUNT(*) as c FROM questions_curated_staging WHERE is_anulada = 1 OR is_anulada = 'true' OR is_anulada = '1'").get().c;
const semGabaritoReal = db.prepare(`
  SELECT COUNT(*) as c 
  FROM questions_curated_staging 
  WHERE (correct_answer IS NULL OR TRIM(correct_answer) = '')
    AND (is_anulada IS NULL OR is_anulada = 0 OR is_anulada = 'false' OR is_anulada = '0')
`).get().c;

// 10. IMAGENS
const imgWithImages = db.prepare("SELECT COUNT(*) as c FROM questions_curated_staging WHERE images IS NOT NULL AND images != '' AND images != '[]' AND images != '{}'").get().c;
const imgWebp = db.prepare("SELECT COUNT(*) as c FROM questions_curated_staging WHERE images LIKE '%.webp%'").get().c;
const imgPng = db.prepare("SELECT COUNT(*) as c FROM questions_curated_staging WHERE images LIKE '%.png%'").get().c;
const imgJpg = db.prepare("SELECT COUNT(*) as c FROM questions_curated_staging WHERE images LIKE '%.jpg%' OR images LIKE '%.jpeg%'").get().c;

// 11. COMENTÁRIOS (COMMENTARY)
const comFilled = db.prepare("SELECT COUNT(*) as c FROM questions_curated_staging WHERE commentary IS NOT NULL AND TRIM(commentary) != '' AND TRIM(commentary) != '[]' AND TRIM(commentary) != '{}'").get().c;
const comAvgLen = db.prepare("SELECT AVG(LENGTH(commentary)) as avg_len FROM questions_curated_staging WHERE commentary IS NOT NULL AND TRIM(commentary) != ''").get().avg_len;

// 12. INTEGRIDADE DE OPTIONS (JSON)
const optEmpty = db.prepare("SELECT COUNT(*) as c FROM questions_curated_staging WHERE options IS NULL OR TRIM(options) = '' OR options = '[]' OR options = '{}'").get().c;
const optHasLetter = db.prepare("SELECT COUNT(*) as c FROM questions_curated_staging WHERE options LIKE '%\"letter\"%'").get().c;

const report = {
  audited_at: new Date().toISOString(),
  total_questions: total,
  curation: {
    curation_status_distribution: curationDist,
    merged_questions_count: mergedCount,
    source_tables_top: sourceTablesDist
  },
  filters: {
    especialidade: {
      total_filled: total - db.prepare("SELECT COUNT(*) as c FROM questions_curated_staging WHERE especialidade IS NULL OR especialidade = ''").get().c,
      null_or_empty: db.prepare("SELECT COUNT(*) as c FROM questions_curated_staging WHERE especialidade IS NULL OR especialidade = ''").get().c,
      distribution: espDist
    },
    tema: {
      distinct_count: temaTotal,
      null_or_empty: temaNull,
      top_temas: topTemas
    },
    foco: {
      distinct_count: focoTotal,
      null_or_empty: focoNull
    },
    subfoco: {
      distinct_count: subfocoTotal,
      null_or_empty: subfocoNull
    },
    institution: {
      distinct_count: instTotal,
      null_or_empty: instNull,
      top_20: topInst
    },
    banca: {
      distinct_count: bancaTotal,
      null_or_empty: bancaNull,
      top_20: topBancas
    },
    year: {
      min: yearRange.min_y,
      max: yearRange.max_y,
      null_or_empty: yearNull,
      distribution_top: yearDist
    },
    difficulty: {
      null_or_empty: diffNull,
      distribution: diffDist
    },
    modalidade: {
      distribution: modDist
    },
    type: {
      null_or_empty: typeNull,
      distribution: typeDist
    }
  },
  content: {
    gabaritos: {
      null_or_empty: correctAnsNull,
      anuladas: anuladasCount,
      sem_gabarito_real: semGabaritoReal,
      top_answers: correctAnsDist
    },
    options: {
      empty: optEmpty,
      with_letter_schema: optHasLetter
    },
    images: {
      questions_with_images: imgWithImages,
      webp_count: imgWebp,
      png_count: imgPng,
      jpg_count: imgJpg
    },
    commentary: {
      filled_count: comFilled,
      pct: ((comFilled / total) * 100).toFixed(2),
      avg_char_length: Math.round(comAvgLen || 0)
    }
  }
};

fs.writeFileSync('data/supabase_tables/ssot_comprehensive_audit_report.json', JSON.stringify(report, null, 2), 'utf8');
console.log('✅ Relatório completo salvo em data/supabase_tables/ssot_comprehensive_audit_report.json');
db.close();
