import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const localFiles = [
  'data/obstetricia_final_questions.json',
  'data/ginecologia_final_questions.json',
  'data/pediatria_final_questions.json',
  'data/clinica_medica_final_questions.json',
  'data/cirurgia_final_questions.json',
  'data/urologia_final_questions.json'
];

let totalLocalGold = 0;
let inDiretoMatch = 0;
let inDiretoWithGoldInStaging = 0;
let canSyncToStaging = 0;

const stagingMap = new Map();
const rows = db.prepare("SELECT id, code, modalidade, commentary FROM questions_curated_staging WHERE modalidade = 'Acesso Direto'").all();
for (const r of rows) {
  // Guarda por code e pelo id normalizado (sem prefixo questions_ ou questions_expansion_direto_)
  const cleanId = r.id.replace(/^questions_expansion_direto_/, '').replace(/^questions_/, '');
  stagingMap.set(cleanId, r.commentary || '');
  if (r.code) stagingMap.set(r.code, r.commentary || '');
}

console.log(`Carregadas ${rows.length} questões de Acesso Direto.`);

for (const f of localFiles) {
  if (!fs.existsSync(f)) continue;
  const list = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const q of list) {
    const comm = q.commentary || '';
    if (!comm.includes('Take-Home')) continue;
    totalLocalGold++;

    const commInStaging = stagingMap.get(q.id) || (q.code ? stagingMap.get(q.code) : null);
    if (commInStaging !== undefined) {
      inDiretoMatch++;
      if (commInStaging.includes('Take-Home')) {
        inDiretoWithGoldInStaging++;
      } else {
        canSyncToStaging++;
      }
    }
  }
}

console.log('\n📊 CRUZAMENTO REAL DOS 85.612 COMENTÁRIOS OURO LOCAIS:');
console.log(` - Total de Comentários Ouro produzidos: ${totalLocalGold.toLocaleString('pt-BR')}`);
console.log(` - Comentários Ouro que pertencem ao Acesso Direto: ${inDiretoMatch.toLocaleString('pt-BR')}`);
console.log(` - Já com Take-Home gravado em Staging/Direto: ${inDiretoWithGoldInStaging.toLocaleString('pt-BR')}`);
console.log(` - Estão prontos localmente mas AINDA NÃO FORAM PROPAGADOS para o banco direto: ${canSyncToStaging.toLocaleString('pt-BR')}`);
console.log(` - Comentários Ouro de outras modalidades (R+, Revalida, Título): ${(totalLocalGold - inDiretoMatch).toLocaleString('pt-BR')}`);

