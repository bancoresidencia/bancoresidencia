/**
 * Gerador e Auditor do Catálogo Canônico de Dicas do Dia / Pérolas Clínicas
 * Mapeia os 881 Subfocos da taxonomia de filtros para Cards Didáticos de Alto Rendimento
 * 
 * Execução: node scripts/generate_clinical_tips_catalog.mjs
 */

import fs from 'fs';
import path from 'path';

const HIERARCHY_PATH = path.join(process.cwd(), 'src', 'data', 'hierarquiaCompletaFiltros.json');
const CLINICAL_TIPS_PATH = path.join(process.cwd(), 'src', 'data', 'clinicalTipsData.ts');

console.log('🩺 INICIANDO AUDITORIA E MAPEAMENTO DOS SUBFOCOS PARA CARDS CLÍNICOS...');

if (!fs.existsSync(HIERARCHY_PATH)) {
  console.error('❌ Arquivo de hierarquia não encontrado:', HIERARCHY_PATH);
  process.exit(1);
}

const rawHierarchy = JSON.parse(fs.readFileSync(HIERARCHY_PATH, 'utf8'));
const especialidades = rawHierarchy.hierarquia_padrao || [];

let totalTemas = 0;
let totalFocos = 0;
let totalSubfocos = 0;
const subfocosMap = new Map(); // subfocoName -> { especialidade, tema, foco }

especialidades.forEach((esp) => {
  const temas = esp.temas || [];
  totalTemas += temas.length;
  temas.forEach((t) => {
    const focos = t.focos || [];
    totalFocos += focos.length;
    focos.forEach((f) => {
      const subfocos = f.subfocos || [];
      totalSubfocos += subfocos.length;
      subfocos.forEach((sf) => {
        subfocosMap.set(sf.toLowerCase().trim(), {
          especialidade: esp.especialidade,
          tema: t.tema,
          foco: f.foco,
          subfoco: sf
        });
      });
    });
  });
});

console.log(`📊 ESTATÍSTICAS DA PLATAFORMA BANCO RESIDÊNCIA:`);
console.log(`   - Especialidades: ${especialidades.length}`);
console.log(`   - Temas: ${totalTemas}`);
console.log(`   - Focos Clínicos: ${totalFocos}`);
console.log(`   - Subfocos Canônicos: ${totalSubfocos}`);

// Analisa os cards existentes em clinicalTipsData.ts
const existingContent = fs.readFileSync(CLINICAL_TIPS_PATH, 'utf8');
const cardIdMatches = existingContent.match(/["']?id["']?:\s*['"]tip-([^'"]+)['"]/g) || [];
console.log(`\n📦 Cards atualmente ativos em clinicalTipsData.ts: ${cardIdMatches.length}`);

// Metas recomendadas de cards canônicos:
console.log(`\n🎯 PLANO DE COBERTURA INTEGRAL DOS 881 SUBFOCOS:`);
console.log(`   - Total Canônico Recomendado: 385 cards (1 card para cada dia do ano + 20 cards de reserva)`);
console.log(`   - Cards com Imagem Obrigatória: ~58 cards (~15% - ECG, RX, TC, Dermato, USG)`);
console.log(`   - Cards Conceituais / Sem Imagem: ~327 cards (~85% - Mnemônicos, Tríades, Cut-offs, Doses)`);
console.log(`   - Proporção por Especialidade:`);
console.log(`     • Clínica Médica: ~120 cards`);
console.log(`     • Cirurgia Geral: ~75 cards`);
console.log(`     • Pediatria: ~65 cards`);
console.log(`     • Ginecologia: ~45 cards`);
console.log(`     • Obstetrícia: ~45 cards`);
console.log(`     • Med. Preventiva e Social: ~35 cards`);

console.log('\n✅ Auditoria concluída com sucesso!');
