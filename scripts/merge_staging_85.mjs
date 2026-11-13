import fs from 'fs';

const stagingPath = 'data/staging_homologados_85pct.json';
const auditPath = 'data/cruzamento_ultimas_provas_audit.json';

const staging = JSON.parse(fs.readFileSync(stagingPath, 'utf8'));
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));

const existingCodes = new Set(staging.decisoes.map(d => d.code));
const newMatches = audit.hubs['SES-GO'].detalhes.filter(m => !existingCodes.has(m.code));

console.log(`Existentes em staging_homologados_85pct.json: ${staging.decisoes.length}`);
console.log(`Novos matches homologados encontrados: ${newMatches.length}`);

for (const m of newMatches) {
  staging.decisoes.push({
    id: m.id,
    code: m.code,
    ano: m.year,
    caderno: m.edicao,
    qNum: m.qNum,
    similaridadeEnunciado: m.stmtSim,
    similaridadeAlternativa: m.optSim,
    gabaritoOficialExtraido: m.gabaritoOficial,
    gabaritoMapeadoNoBanco: m.gabaritoOficial,
    foiRemapeado: false,
    isAnulada: m.isAnulada,
    dataHomologacao: new Date().toISOString()
  });
}

staging.totalHomologados = staging.decisoes.length;
staging.ultimaAtualizacao = new Date().toISOString();

fs.writeFileSync(stagingPath, JSON.stringify(staging, null, 2));
console.log(`Novo total homologado em staging (sem commit ao Supabase): ${staging.totalHomologados}`);
