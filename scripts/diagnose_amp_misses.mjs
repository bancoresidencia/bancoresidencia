import fs from 'fs';
import { extractPdfText, norm, calculateSimilarity } from './pdf_crossref_utils.mjs';

async function diagnose() {
  const data = JSON.parse(fs.readFileSync('data/pending_amp_questions.json', 'utf8'));

  const files = {
    2024: 'data/official_exams/AMP_PARANA/AMP_2024_PROVA_GERAL.pdf',
    2025: 'data/official_exams/AMP_PARANA/AMP_2025_PROVA_GERAL.pdf',
    2026: 'data/official_exams/AMP_PARANA/AMP_2026_PROVA_GERAL.pdf'
  };

  const texts = {};
  for (const [y, f] of Object.entries(files)) {
    console.log(`Carregando texto de AMP ${y}...`);
    texts[y] = await extractPdfText(f);
    console.log(`  -> Tamanho do texto AMP ${y}: ${texts[y].length} caracteres`);
  }

  console.log('\n--- DIAGNÓSTICO DAS 11 QUESTÕES PENDENTES ---');
  for (const q of data) {
    console.log(`\nQuestão [${q.code}] (Ano: ${q.year}, ${q.especialidade}):`);
    
    // 1. Verificar se o ano do PDF existe
    if (!texts[q.year]) {
      console.log(`  ❌ Motivo: Não temos o PDF oficial da prova de ${q.year} baixado (apenas 2024, 2025 e 2026 foram baixados).`);
      continue;
    }

    const pdfText = texts[q.year];
    if (pdfText.length < 500) {
      console.log(`  ⚠️ Alerta: O texto extraído do PDF de ${q.year} é muito curto (${pdfText.length} chars). Pode ser PDF digitalizado/escaneado em imagem (OCR necessário)!`);
      continue;
    }

    // 2. Buscar trechos-chave do enunciado
    const words = norm(q.statement).split(' ').filter(w => w.length > 4);
    const samplePhrase = words.slice(0, 5).join(' ');
    const foundInText = norm(pdfText).includes(samplePhrase);

    console.log(`  Texto do PDF ${q.year} tem tamanho: ${pdfText.length} caracteres.`);
    console.log(`  Frase de busca: "${samplePhrase}"`);
    console.log(`  Encontrado no PDF ${q.year}? ${foundInText ? 'SIM!' : 'NÃO'}`);

    if (foundInText) {
      console.log(`  -> A questão ESTÁ no PDF! Verificando porque não passou na Dupla-Trava...`);
      // buscar onde está e calcular similaridade
    } else {
      // testar se é de outra especialidade/caderno R+ ou se o PDF tem OCR degradado
      console.log(`  -> Não encontrado no Caderno Geral. Pode ser: Caderno de Especialidade R+, Prova Prática ou OCR com ruído.`);
    }
  }
}

diagnose();

