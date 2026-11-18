import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(DB_PATH, { readOnly: true });

console.log('='.repeat(80));
console.log('📊 AUDITORIA DO ACERVO GLOBAL EM questions_curated_staging');
console.log('='.repeat(80));

// 1. Total Geral na Staging
const totalRow = db.prepare(`
  SELECT 
    count(1) as total,
    count(CASE WHEN commentary IS NOT NULL AND length(trim(commentary)) > 30 THEN 1 END) as com_comentario,
    count(CASE WHEN commentary IS NULL OR length(trim(commentary)) <= 30 THEN 1 END) as sem_comentario
  FROM questions_curated_staging
`).get();

console.log('Total Staging:', totalRow);

// 2. Por Especialidade Canônica
const specRows = db.prepare(`
  SELECT 
    CASE 
      WHEN especialidade LIKE '%Cirurg%' THEN 'Cirurgia Geral'
      WHEN especialidade LIKE '%Clínic%' THEN 'Clínica Médica'
      WHEN especialidade LIKE '%Pediatr%' THEN 'Pediatria'
      WHEN especialidade LIKE '%Ginecol%' AND especialidade NOT LIKE '%Obstetr%' THEN 'Ginecologia'
      WHEN especialidade LIKE '%Obstetr%' AND especialidade NOT LIKE '%Ginecol%' THEN 'Obstetrícia'
      WHEN especialidade LIKE '%Ginecol%' AND especialidade LIKE '%Obstetr%' THEN 'Ginecologia e Obstetrícia'
      WHEN especialidade LIKE '%Preventiv%' OR especialidade LIKE '%Social%' OR especialidade LIKE '%Coletiv%' THEN 'Medicina Preventiva'
      ELSE 'Outras / Subespecialidades'
    END as grupo_especialidade,
    count(1) as total,
    count(CASE WHEN commentary IS NOT NULL AND length(trim(commentary)) > 30 THEN 1 END) as com_comentario,
    count(CASE WHEN commentary IS NULL OR length(trim(commentary)) <= 30 THEN 1 END) as sem_comentario
  FROM questions_curated_staging
  GROUP BY grupo_especialidade
  ORDER BY total DESC
`).all();

console.log('\n--- Agrupamento Principal na Staging ---');
console.table(specRows);

// 3. Verifica os arquivos específicos de cada lote em data/
console.log('\n--- Verificação dos Arquivos Específicos em data/ ---');
const files = [
  { name: 'Medicina Preventiva', file: 'data/medicina_preventiva_final_questions.json' },
  { name: 'Cirurgia Geral (Acesso Direto)', file: 'data/cirurgia_direto_questions.json' },
  { name: 'Clínica Médica', file: 'data/clinica_medica_final_questions.json' },
  { name: 'Pediatria (Acesso Direto)', file: 'data/pediatria_direto_questions.json' },
  { name: 'Ginecologia (Acesso Direto)', file: 'data/ginecologia_direto_questions.json' },
  { name: 'Obstetrícia (Acesso Direto)', file: 'data/obstetricia_direto_questions.json' }
];

const fileStats = [];
for (const f of files) {
  if (fs.existsSync(f.file)) {
    try {
      const data = JSON.parse(fs.readFileSync(f.file, 'utf8'));
      const total = data.length;
      const comComentario = data.filter(q => q.commentary && q.commentary.trim().length > 30).length;
      const semComentario = total - comComentario;
      const pct = total > 0 ? ((comComentario / total) * 100).toFixed(1) : '0';
      fileStats.push({
        especialidade: f.name,
        total,
        comComentario,
        semComentario,
        pct: `${pct}%`,
        file: f.file
      });
    } catch (e) {
      fileStats.push({ especialidade: f.name, error: e.message });
    }
  } else {
    fileStats.push({ especialidade: f.name, error: 'Arquivo não existe' });
  }
}
console.table(fileStats);

// Salva o resultado auditado para uso direto no dashboard
fs.writeFileSync('data/macro_specialty_stats.json', JSON.stringify({
  updatedAt: new Date().toISOString(),
  stagingGlobal: totalRow,
  groups: specRows,
  files: fileStats
}, null, 2), 'utf8');

console.log('\n✅ Dados gravados em data/macro_specialty_stats.json');
