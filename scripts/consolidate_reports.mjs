import fs from 'fs';

const oldRep = JSON.parse(fs.readFileSync('data/relatorio_aplicacao_supabase_176.json', 'utf8'));
const abemRep = JSON.parse(fs.readFileSync('data/relatorio_aplicacao_abem_96.json', 'utf8'));

const existingIds = new Set(oldRep.registros.map(r => r.id));

let added = 0;
for (const item of abemRep.detalhes) {
  if (!existingIds.has(item.id)) {
    oldRep.registros.push({
      id: item.id,
      code: item.code,
      status: item.status,
      gabarito: item.gabarito,
      origem: 'ABEM_2026_OFICIAL_DUPLA_TRAVA',
      similaridadeEnunciado: item.simEnunciado,
      similaridadeAlternativa: item.simAlternativa,
      dataHomologacao: abemRep.data
    });
    existingIds.add(item.id);
    added++;
  }
}

oldRep.totalProcessado = oldRep.registros.length;
oldRep.sucesso = oldRep.registros.filter(r => r.status === 'SUCCESS').length;
oldRep.erros = oldRep.registros.filter(r => r.status === 'ERROR').length;
oldRep.pendenciasRestantes = 10402;
oldRep.dataAtualizacao = new Date().toISOString();

fs.writeFileSync('data/relatorio_aplicacao_supabase_176.json', JSON.stringify(oldRep, null, 2), 'utf8');
console.log(`Relatório consolidado com sucesso! Total registros: ${oldRep.registros.length} (adicionados: ${added})`);
