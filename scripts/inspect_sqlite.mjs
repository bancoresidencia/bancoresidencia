import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/gabaritos_nacional.db');
const fontes = db.prepare('SELECT id, nome_instituicao, sigla, banca, uf FROM fontes').all();
console.log('--- FONTES CADASTRADAS ---');
for (const f of fontes) {
  console.log(`[${f.id}] ${f.sigla} | ${f.nome_instituicao} | Banca: ${f.banca} | UF: ${f.uf}`);
}

for (const t of tables) {
  const count = db.prepare(`SELECT count(*) as total FROM ${t.name}`).get();
  console.log(`Tabela ${t.name}: ${count.total} registros`);
  const sample = db.prepare(`SELECT * FROM ${t.name} LIMIT 3`).all();
  console.log('Amostra:', sample);
}
