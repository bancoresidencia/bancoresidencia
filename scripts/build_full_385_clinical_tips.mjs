/**
 * Gerador do Acervo Canônico Completo de 385 Cards Clínicos
 * Mapeia todos os 435 Focos e 881 Subfocos das 6 Grandes Áreas de Residência Médica
 * 
 * Execução: node scripts/build_full_385_clinical_tips.mjs
 */

import fs from 'fs';
import path from 'path';

const HIERARCHY_PATH = path.join(process.cwd(), 'src', 'data', 'hierarquiaCompletaFiltros.json');
const OUTPUT_PATH = path.join(process.cwd(), 'src', 'data', 'clinicalTipsData.ts');

const hierarchyRaw = JSON.parse(fs.readFileSync(HIERARCHY_PATH, 'utf8'));
const especialidades = hierarchyRaw.hierarquia_padrao || [];

console.log('Iniciando compilação dos 385 cards canônicos...');
