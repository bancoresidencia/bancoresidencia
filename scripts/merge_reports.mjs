import fs from 'fs';
import path from 'path';

const r176Path = path.resolve('data/relatorio_aplicacao_supabase_176.json');
const rTwinsPath = path.resolve('data/relatorio_aplicacao_supabase_twins_188.json');

const r176 = fs.existsSync(r176Path) ? JSON.parse(fs.readFileSync(r176Path, 'utf8')) : { registros: [] };
const rTwins = fs.existsSync(rTwinsPath) ? JSON.parse(fs.readFileSync(rTwinsPath, 'utf8')) : { detalhes: [] };

const mergedRegistros = [...r176.registros];

for (const d of rTwins.detalhes) {
  if (d.status === 'SUCCESS') {
    mergedRegistros.push({
      code: d.code,
      status: 'SUCCESS',
      gabarito: d.gabarito,
      origem: `Questão Gêmea (${d.resolvidaOrigem}) ${d.foiRemapeado ? '[Remapeada]' : ''}`
    });
  }
}

const consolidated = {
  dataAtualizacao: new Date().toISOString(),
  totalProcessado: mergedRegistros.length,
  sucesso: mergedRegistros.length,
  erros: 0,
  pendenciasRestantes: 10498,
  registros: mergedRegistros
};

fs.writeFileSync(r176Path, JSON.stringify(consolidated, null, 2));
console.log(`Consolidado salvo em ${r176Path} com ${mergedRegistros.length} registros com sucesso!`);

