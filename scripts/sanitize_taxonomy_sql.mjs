import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const applyMode = process.argv.includes('--apply');

const db = new DatabaseSync(DB_PATH, { readOnly: !applyMode });

console.log('================================================================================');
console.log(`🧹 SANEAMENTO TAXONÔMICO DETERMINÍSTICO — ${applyMode ? 'MODO APPLY (GRAVAÇÃO)' : 'MODO DRY-RUN (SIMULAÇÃO)'}`);
console.log('================================================================================\n');

const rules = [
  // 1. Unificação de grafias de especialidade
  {
    desc: "Especialidade: 'Preventiva' -> 'Medicina Preventiva e Social'",
    countSql: "SELECT count(1) as c FROM questions_curated_staging WHERE especialidade = 'Preventiva'",
    updateSql: "UPDATE questions_curated_staging SET especialidade = 'Medicina Preventiva e Social' WHERE especialidade = 'Preventiva'"
  },
  {
    desc: "Especialidade: 'Obstetricia' -> 'Obstetrícia'",
    countSql: "SELECT count(1) as c FROM questions_curated_staging WHERE especialidade = 'Obstetricia'",
    updateSql: "UPDATE questions_curated_staging SET especialidade = 'Obstetrícia' WHERE especialidade = 'Obstetricia'"
  },
  {
    desc: "Especialidade: 'ClinicaMedica' -> 'Clínica Médica'",
    countSql: "SELECT count(1) as c FROM questions_curated_staging WHERE especialidade = 'ClinicaMedica'",
    updateSql: "UPDATE questions_curated_staging SET especialidade = 'Clínica Médica' WHERE especialidade = 'ClinicaMedica'"
  },
  {
    desc: "Especialidade: 'Cirurgia Geral' -> 'Cirurgia'",
    countSql: "SELECT count(1) as c FROM questions_curated_staging WHERE especialidade = 'Cirurgia Geral'",
    updateSql: "UPDATE questions_curated_staging SET especialidade = 'Cirurgia' WHERE especialidade = 'Cirurgia Geral'"
  },

  // 2. Correção de choques cruzados óbvios (Tema pertencente a outra especialidade)
  {
    desc: "Cruzamento: Clínica Médica + tema 'Trauma' -> 'Cirurgia'",
    countSql: "SELECT count(1) as c FROM questions_curated_staging WHERE especialidade = 'Clínica Médica' AND tema = 'Trauma'",
    updateSql: "UPDATE questions_curated_staging SET especialidade = 'Cirurgia' WHERE especialidade = 'Clínica Médica' AND tema = 'Trauma'"
  },
  {
    desc: "Cruzamento: Clínica Médica + temas pediátricos ('Neonatologia', 'PneumologiaPediatrica') -> 'Pediatria'",
    countSql: "SELECT count(1) as c FROM questions_curated_staging WHERE especialidade = 'Clínica Médica' AND tema IN ('Neonatologia', 'PneumologiaPediatrica')",
    updateSql: "UPDATE questions_curated_staging SET especialidade = 'Pediatria' WHERE especialidade = 'Clínica Médica' AND tema IN ('Neonatologia', 'PneumologiaPediatrica')"
  },
  {
    desc: "Cruzamento: Clínica Médica + temas ginecológicos ('GinecologiaEndocrina', 'OncologiaGinecologica') -> 'Ginecologia'",
    countSql: "SELECT count(1) as c FROM questions_curated_staging WHERE especialidade = 'Clínica Médica' AND tema IN ('GinecologiaEndocrina', 'OncologiaGinecologica')",
    updateSql: "UPDATE questions_curated_staging SET especialidade = 'Ginecologia' WHERE especialidade = 'Clínica Médica' AND tema IN ('GinecologiaEndocrina', 'OncologiaGinecologica')"
  },
  {
    desc: "Cruzamento: Ginecologia + tema 'Obstetrícia' -> 'Obstetrícia'",
    countSql: "SELECT count(1) as c FROM questions_curated_staging WHERE especialidade = 'Ginecologia' AND tema = 'Obstetrícia'",
    updateSql: "UPDATE questions_curated_staging SET especialidade = 'Obstetrícia' WHERE especialidade = 'Ginecologia' AND tema = 'Obstetrícia'"
  },

  // 3. Limpeza de temas camelCase / colados de scrapers
  {
    desc: "Tema camelCase: 'GinecologiaEndocrina' -> 'Ginecologia Endócrina'",
    countSql: "SELECT count(1) as c FROM questions_curated_staging WHERE tema = 'GinecologiaEndocrina'",
    updateSql: "UPDATE questions_curated_staging SET tema = 'Ginecologia Endócrina' WHERE tema = 'GinecologiaEndocrina'"
  },
  {
    desc: "Tema camelCase: 'OncologiaGinecologica' -> 'Oncologia Ginecológica'",
    countSql: "SELECT count(1) as c FROM questions_curated_staging WHERE tema = 'OncologiaGinecologica'",
    updateSql: "UPDATE questions_curated_staging SET tema = 'Oncologia Ginecológica' WHERE tema = 'OncologiaGinecologica'"
  },
  {
    desc: "Tema camelCase: 'PneumologiaPediatrica' -> 'Pneumologia Pediátrica'",
    countSql: "SELECT count(1) as c FROM questions_curated_staging WHERE tema = 'PneumologiaPediatrica'",
    updateSql: "UPDATE questions_curated_staging SET tema = 'Pneumologia Pediátrica' WHERE tema = 'PneumologiaPediatrica'"
  },
  {
    desc: "Tema camelCase: 'MedicinaPreventivaEpidemiologi' -> 'Epidemiologia'",
    countSql: "SELECT count(1) as c FROM questions_curated_staging WHERE tema = 'MedicinaPreventivaEpidemiologi'",
    updateSql: "UPDATE questions_curated_staging SET tema = 'Epidemiologia' WHERE tema = 'MedicinaPreventivaEpidemiologi'"
  },
  {
    desc: "Tema camelCase: 'SaudeDoTrabalhador' -> 'Saúde do Trabalhador e Riscos Ocupacionais'",
    countSql: "SELECT count(1) as c FROM questions_curated_staging WHERE tema = 'SaudeDoTrabalhador'",
    updateSql: "UPDATE questions_curated_staging SET tema = 'Saúde do Trabalhador e Riscos Ocupacionais' WHERE tema = 'SaudeDoTrabalhador'"
  },
  {
    desc: "Tema camelCase: 'SistemaUnicoDeSaudeSus' -> 'Sistema Único de Saúde (SUS): Princípios e Legislação'",
    countSql: "SELECT count(1) as c FROM questions_curated_staging WHERE tema = 'SistemaUnicoDeSaudeSus'",
    updateSql: "UPDATE questions_curated_staging SET tema = 'Sistema Único de Saúde (SUS): Princípios e Legislação' WHERE tema = 'SistemaUnicoDeSaudeSus'"
  },
  {
    desc: "Tema camelCase: 'MedicinaLegal' -> 'Medicina Legal e Perícias'",
    countSql: "SELECT count(1) as c FROM questions_curated_staging WHERE tema = 'MedicinaLegal'",
    updateSql: "UPDATE questions_curated_staging SET tema = 'Medicina Legal e Perícias' WHERE tema = 'MedicinaLegal'"
  }
];

let totalAffected = 0;

if (applyMode) {
  db.exec('BEGIN TRANSACTION;');
}

try {
  for (const r of rules) {
    const count = db.prepare(r.countSql).get().c;
    console.log(`• ${r.desc}: ${count} registros`);
    totalAffected += count;
    if (applyMode && count > 0) {
      db.exec(r.updateSql);
    }
  }

  if (applyMode) {
    db.exec('COMMIT;');
    console.log(`\n✅ SANEAMENTO APLICADO COM SUCESSO! Total de operações de correção: ${totalAffected}`);
  } else {
    console.log(`\nℹ️ DRY-RUN CONCLUÍDO. Total de registros que seriam corrigidos: ${totalAffected}`);
    console.log('   Para aplicar no SQLite local, execute: node scripts/sanitize_taxonomy_sql.mjs --apply');
  }
} catch (err) {
  if (applyMode) {
    db.exec('ROLLBACK;');
  }
  console.error('❌ Erro durante o saneamento:', err.message);
  process.exit(1);
}
