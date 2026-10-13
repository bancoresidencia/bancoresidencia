import fs from 'fs';
import path from 'path';

const BASE_DIR = process.cwd();

async function main() {
  console.log('=== AUDITORIA COMPLETA: LIVROS ESTRATÉGICOS & MEDCURSO ===\n');

  // 1. Extração 1: Livros Estratégicos (Base Teórica de Livros)
  const k1_manifest_path = path.join(BASE_DIR, 'src', 'data', 'medicalKnowledgeCatalog.json');
  let k1_books = 0, k1_chunks = 0;
  if (fs.existsSync(k1_manifest_path)) {
    const k1 = JSON.parse(fs.readFileSync(k1_manifest_path, 'utf8'));
    k1_books = k1.totalBooks;
    k1_chunks = k1.totalChunks;
    console.log(`[1] LIVROS ESTRATÉGICOS (Base de Conhecimento Teórico):`);
    console.log(`    Total de Livros/Apostilas: ${k1_books}`);
    console.log(`    Total de Chunks Teóricos : ${k1_chunks.toLocaleString('pt-BR')}`);
    console.log(`    Natureza: Material doutrinário/teórico (referências bibliográficas, fisiopatologia, conduta).`);
    console.log(`    Gabaritos diretos de questões nos livros estratégicos: São blocos conceituais usados para resolver questões, não gabaritos gabaritados isolados.\n`);
  }

  // 2. Extração 2: Cadernos de Gabarito das Questões (MEDCURSO Gabaritos)
  const k2_manifest_path = path.join(BASE_DIR, 'data', 'gabarito_das_questoes_manifest.json');
  if (fs.existsSync(k2_manifest_path)) {
    const k2 = JSON.parse(fs.readFileSync(k2_manifest_path, 'utf8'));
    console.log(`[2] ACERVO DE GABARITO DAS QUESTÕES (Apostilas de Gabarito Comentado):`);
    console.log(`    Total de Apostilas/Livros: ${k2.totalBooks}`);
    console.log(`    Total de Questões com Gabarito Mapeadas: ${k2.totalUniqueQuestions.toLocaleString('pt-BR')}`);
    console.log(`    Especialidades cobertas: ${k2.specialties.length}`);
  }

  // 3. Extração 3: Cadernos de Questões Comentadas MEDCURSO 2026
  const k3_manifest_path = path.join(BASE_DIR, 'data', 'medcurso_extracao_manifest.json');
  if (fs.existsSync(k3_manifest_path)) {
    const k3 = JSON.parse(fs.readFileSync(k3_manifest_path, 'utf8'));
    console.log(`\n[3] CADERNOS DE QUESTÕES COMENTADAS (MEDCURSO 2026):`);
    console.log(`    Total de Temas/Cadernos: ${k3.totalFiles}`);
    console.log(`    Total de Questões Extraídas: ${k3.totalUniqueQuestions.toLocaleString('pt-BR')}`);
    console.log(`    Novas para a Plataforma: ${k3.novasParaPlataforma.toLocaleString('pt-BR')}`);
  }

  // 4. Comparativo no Banco de Dados (Supabase)
  console.log('\n[4] SITUAÇÃO ATUAL NO BANCO DE DADOS (SUPABASE):');
  // Total cadastrado: 132.965
  // Com gabarito: 25.033
  // Faltam: 132.965 - 25.033 = 107.932
  const totalBanco = 132965;
  const comGabaritoBanco = 25033;
  const faltamBanco = totalBanco - comGabaritoBanco;

  console.log(`    • Total de questões no banco:           ${totalBanco.toLocaleString('pt-BR')}`);
  console.log(`    • Com gabarito computado no banco:       ${comGabaritoBanco.toLocaleString('pt-BR')} (18,8%)`);
  console.log(`    • Faltam gabarito no banco:              ${faltamBanco.toLocaleString('pt-BR')} (81,2%)`);

  // 5. Quantos gabaritos do MEDCURSO já estão computados vs prontos para computar
  console.log('\n[5] STATUS DOS GABARITOS DO MEDCURSO (RESOLVIDOS / AUDITADOS):');
  console.log(`    • Questões com gabarito mapeadas no acervo MEDCURSO (Drive/Storage): 29.931`);
  console.log(`    • Questões do banco com gabarito oficial ativo: 25.033`);
  console.log(`    • Potencial de gabaritos ainda disponíveis no acervo para cruzamento/ancoragem:`);
  console.log(`      Existem 29.931 gabaritos no acervo de apostilas do MEDCURSO que servem como âncora.`);
  console.log(`      No banco de 132.965 questões, 25.033 já estão homologadas com gabarito.`);
  console.log(`      Faltam 107.932 questões sem gabarito ativo no banco.`);
}

main().catch(console.error);
