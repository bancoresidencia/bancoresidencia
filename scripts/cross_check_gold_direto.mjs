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
let inDiretoById = 0;
let inDiretoByCode = 0;
let inDiretoWithGoldAlready = 0;
let canSyncToDireto = 0;

const diretoIds = new Map();
const diretoRows = db.prepare("SELECT id, code, commentary FROM questions_curated_staging WHERE modalidade = 'Acesso Direto'").all();
for (const r of diretoRows) {
  diretoIds.set(r.id, r.commentary || '');
}

console.log(`Carregadas ${diretoIds.size} questões de Acesso Direto do banco curado.`);

for (const f of localFiles) {
  if (!fs.existsSync(f)) continue;
  const list = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const q of list) {
    const comm = q.commentary || '';
    if (!comm.includes('Take-Home')) continue;
    totalLocalGold++;

    if (diretoIds.has(q.id)) {
      inDiretoById++;
      const currentComm = diretoIds.get(q.id);
      if (currentComm.includes('Take-Home')) {
        inDiretoWithGoldAlready++;
      } else {
        canSyncToDireto++;
      }
    }
  }
}

console.log('\n📊 CRUZAMENTO DOS COMENTÁRIOS OURO LOCAIS COM O ACERVO DE ACESSO DIRETO:');
console.log(` - Total de Comentários Ouro produzidos localmente: ${totalLocalGold.toLocaleString('pt-BR')}`);
console.log(` - Comentários Ouro que pertencem ao Acesso Direto (por ID): ${inDiretoById.toLocaleString('pt-BR')}`);
console.log(` - Já com Padrão-Ouro ativo em Acesso Direto: ${inDiretoWithGoldAlready.toLocaleString('pt-BR')}`);
console.log(` - Podem ser atualizados imediatamente para Padrão-Ouro em Acesso Direto: ${canSyncToDireto.toLocaleString('pt-BR')}`);
console.log(` - Comentários Ouro que pertencem a outras modalidades (R+, Revalida, etc.): ${(totalLocalGold - inDiretoById).toLocaleString('pt-BR')}`);

