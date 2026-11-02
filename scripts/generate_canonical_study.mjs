#!/usr/bin/env node

/**
 * Script Oficial de Geração Canônica por Linha de Comando / Agente (Plano Mestre v2.7.0)
 * Uso:
 *   node scripts/generate_canonical_study.mjs --foco="Apendicite Aguda" --especialidade="Cirurgia Geral" --tema="Abdome Agudo Inflamatório"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Helper para ler argumentos da CLI
function getArg(name, defaultValue = '') {
  const match = process.argv.find(arg => arg.startsWith(`--${name}=`));
  if (match) return match.split('=')[1].replace(/^["']|["']$/g, '').trim();
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1].replace(/^["']|["']$/g, '').trim();
  }
  return defaultValue;
}

const foco = getArg('foco');
const especialidade = getArg('especialidade', 'Clínica Médica');
const tema = getArg('tema', foco);
const mode = getArg('mode', 'hybrid');

if (!foco) {
  console.error('❌ Erro: Parâmetro --foco é obrigatório.');
  console.log('Exemplo de uso:');
  console.log('  node scripts/generate_canonical_study.mjs --foco="Apendicite Aguda" --especialidade="Cirurgia Geral" --tema="Abdome Agudo"');
  process.exit(1);
}

console.log(`\n============================================================`);
console.log(`🚀 INICIANDO PIPELINE CANÔNICO: BANCO RESIDÊNCIA (v2.7.0)`);
console.log(`============================================================`);
console.log(`• Especialidade : ${especialidade}`);
console.log(`• Tema          : ${tema}`);
console.log(`• Foco Clínico  : ${foco}`);
console.log(`• Modo do Motor : ${mode}\n`);

async function run() {
  try {
    // 1. Chamar a rota interna de geração
    const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    console.log(`📡 [1/4] Disparando rota /api/ai/study-generator em ${apiUrl}...`);

    let res;
    try {
      res = await fetch(`${apiUrl}/api/ai/study-generator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          especialidade,
          tema,
          foco,
          mode,
          type: 'both'
        })
      });
    } catch (fetchErr) {
      console.warn(`⚠️ Não foi possível conectar a ${apiUrl} (o servidor dev pode estar desligado).`);
      console.log(`💡 Para rodar a rota HTTP, certifique-se de que "npm run dev" esteja rodando em outro terminal.`);
      throw fetchErr;
    }

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Erro HTTP ${res.status}: ${errBody}`);
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Falha desconhecida no pipeline.');
    }

    console.log(`✅ [2/4] Censo Concluído: ${data.statistics.totalQuestions} questões analisadas.`);
    console.log(`✅ [2/4] Conteúdo Gerado: ${data.flashcards.length} flashcards + Resumo Clínico.`);

    // 2. Salvar Markdown na pasta docs/
    const slug = foco.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    const docPath = path.join(ROOT_DIR, 'docs', `resumo_${slug}_alto_rendimento.md`);
    fs.writeFileSync(docPath, data.summaryMarkdown, 'utf-8');
    console.log(`📄 [3/4] Resumo salvo em: docs/resumo_${slug}_alto_rendimento.md`);

    // 3. Integrar permanentemente em src/data/studyMaterialsData.ts
    const studyMaterialsPath = path.join(ROOT_DIR, 'src', 'data', 'studyMaterialsData.ts');
    let studyMatText = fs.readFileSync(studyMaterialsPath, 'utf-8');

    const newMaterial = data.studyMaterialItem;
    // Sanitiza markdown para evitar quebras em string literal
    const materialObjCode = `  {\n    id: ${JSON.stringify(newMaterial.id)},\n    focusId: ${JSON.stringify(newMaterial.focusId)},\n    title: ${JSON.stringify(newMaterial.title)},\n    specialty: ${JSON.stringify(newMaterial.specialty)},\n    theme: ${JSON.stringify(newMaterial.theme)},\n    focus: ${JSON.stringify(newMaterial.focus)},\n    readTimeMinutes: ${newMaterial.readTimeMinutes},\n    lastUpdatedYear: 2026,\n    guidelineBadge: ${JSON.stringify(newMaterial.guidelineBadge)},\n    summarySnippet: ${JSON.stringify(newMaterial.summarySnippet)},\n    keyPoints: ${JSON.stringify(newMaterial.keyPoints, null, 6)},\n    markdownContent: ${JSON.stringify(newMaterial.markdownContent)},\n    flashcardCount: ${newMaterial.flashcardCount}\n  },\n`;

    // Verifica se já existe para atualizar ou inserir no topo
    if (studyMatText.includes(`focus: ${JSON.stringify(newMaterial.focus)}`)) {
      console.log(`ℹ️ [4/4] O material já existia em studyMaterialsData.ts. Atualizando dados...`);
    } else {
      studyMatText = studyMatText.replace(
        'export const INITIAL_STUDY_MATERIALS: StudyMaterialItem[] = [',
        `export const INITIAL_STUDY_MATERIALS: StudyMaterialItem[] = [\n${materialObjCode}`
      );
      fs.writeFileSync(studyMaterialsPath, studyMatText, 'utf-8');
      console.log(`💾 [4/4] Integrado em: src/data/studyMaterialsData.ts`);
    }

    // 4. Integrar flashcards em src/data/flashcardsData.ts
    const flashcardsPath = path.join(ROOT_DIR, 'src', 'data', 'flashcardsData.ts');
    let flashcardsText = fs.readFileSync(flashcardsPath, 'utf-8');

    const newCards = data.flashcardItems || [];
    if (newCards.length > 0) {
      const cardsCode = newCards.map(c => `  ${JSON.stringify(c, null, 2)},\n`).join('');
      flashcardsText = flashcardsText.replace(
        'export const INITIAL_FLASHCARDS: FlashcardItem[] = [',
        `export const INITIAL_FLASHCARDS: FlashcardItem[] = [\n${cardsCode}`
      );
      fs.writeFileSync(flashcardsPath, flashcardsText, 'utf-8');
      console.log(`🎴 [4/4] ${newCards.length} flashcards integrados em: src/data/flashcardsData.ts`);
    }

    console.log(`\n============================================================`);
    console.log(`🎉 MATERIAL PUBLICADO COM SUCESSO NO LOCALHOST!`);
    console.log(`• Acesse: http://localhost:3000`);
    console.log(`• O resumo "${foco}" já está disponível na aba "Resumos Clínicos"`);
    console.log(`• Os ${newCards.length} flashcards já estão disponíveis na aba "Flashcards"`);
    console.log(`============================================================\n`);

  } catch (err) {
    console.error(`\n❌ Falha no Pipeline:`, err.message);
    process.exit(1);
  }
}

run();
