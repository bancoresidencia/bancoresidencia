import assert from 'node:assert/strict';
import {
  getHomologatedBaseline,
  getHomologatedFacets,
  getHomologatedCatalog,
  homologatedDiretoBaseline
} from '@/data/homologatedFacetsBaseline';

console.log('🧪 Testando integridade da Baseline Homologada Padrão-Ouro...');

// 1. Acesso Direto (Residência Médica)
assert.equal(homologatedDiretoBaseline.total, 148113);
assert(homologatedDiretoBaseline.especialidades['Clínica Médica'] > 0);
assert(homologatedDiretoBaseline.especialidades['Cirurgia Geral'] > 0);
assert(homologatedDiretoBaseline.especialidades['Pediatria'] > 0);
assert(homologatedDiretoBaseline.especialidades['Ginecologia e Obstetrícia'] > 0);
assert(homologatedDiretoBaseline.especialidades['Medicina Preventiva e Social'] > 0);
assert.equal(homologatedDiretoBaseline.especialidades['Outras / Em Curadoria'], undefined);

// 2. Total Geral (todas as modalidades combinadas)
const allBaseline = getHomologatedBaseline();
assert.equal(allBaseline.total, 148891);

// 3. Facets e Paths
const facets = getHomologatedFacets(['Acesso Direto']);
assert.equal(facets.totalRightCardCount, 148113);
assert(facets.paths['Pediatria'] > 0);
assert(facets.paths['Clínica Médica'] > 0);
assert(facets.paths['Cirurgia Geral'] > 0);

// 4. Catálogo
const catalog = getHomologatedCatalog(['Acesso Direto']);
assert.equal(catalog.total, 148113);
assert(Object.keys(catalog.bancas).length > 500);
assert(catalog.years.length > 15);

console.log('🎉 TODOS OS TESTES DA BASELINE FORAM APROVADOS COM 100% DE SUCESSO!');
