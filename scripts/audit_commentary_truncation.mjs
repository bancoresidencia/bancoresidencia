import fs from 'fs';

const data = JSON.parse(fs.readFileSync('data/clinica_medica_final_questions.json', 'utf8'));

let totalSolved = 0;
let endsWithEllipsis = [];
let endsWithoutPunctuation = [];
let optionsWithEllipsis = [];
let mainErrorWithEllipsis = [];
let takeHomeWithEllipsis = [];
let lengthDistribution = {
  under400: 0,
  between400and600: 0,
  between600and640: 0,
  between640and650: 0,
  exact650: 0,
  over650: 0
};

for (const q of data) {
  const fc = q.finalCommentary || q.commentary?.finalCommentary || '';
  if (!fc) continue;
  totalSolved++;

  const len = fc.length;
  if (len < 400) lengthDistribution.under400++;
  else if (len < 600) lengthDistribution.between400and600++;
  else if (len < 640) lengthDistribution.between640and650++;
  else if (len < 650) lengthDistribution.between640and650++;
  else if (len === 650) lengthDistribution.exact650++;
  else lengthDistribution.over650++;

  const trimmed = fc.trim();
  if (trimmed.endsWith('...') || trimmed.endsWith('…')) {
    endsWithEllipsis.push({
      id: q.id,
      code: q.code,
      length: len,
      fc: trimmed
    });
  } else if (!/[.!?:"')\]]$/.test(trimmed)) {
    endsWithoutPunctuation.push({
      id: q.id,
      code: q.code,
      lastChar: trimmed.slice(-1),
      length: len,
      fc: trimmed.slice(-100)
    });
  }

  // Check options
  if (q.options && Array.isArray(q.options)) {
    for (const opt of q.options) {
      const exp = (opt.explanation || '').trim();
      if (exp.endsWith('...') || exp.endsWith('…')) {
        optionsWithEllipsis.push({ id: q.id, code: q.code, letter: opt.letter, exp });
      }
    }
  }

  // Check mainErrorReason
  const mer = (q.mainErrorReason || '').trim();
  if (mer.endsWith('...') || mer.endsWith('…')) {
    mainErrorWithEllipsis.push({ id: q.id, code: q.code, mer });
  }

  // Check takeHomeMessage
  const thm = (q.takeHomeMessage || '').trim();
  if (thm.endsWith('...') || thm.endsWith('…')) {
    takeHomeWithEllipsis.push({ id: q.id, code: q.code, thm });
  }
}

console.log('====================================================');
console.log('   RELATÓRIO DE AUDITORIA: TRUNCAMENTO E RETICÊNCIAS');
console.log('====================================================');
console.log(`Total de questões com comentário gerado: ${totalSolved}`);
console.log(`finalCommentary terminando com (...) ou (…): ${endsWithEllipsis.length}`);
console.log(`finalCommentary sem pontuação terminal (. ! ? " ' ) ]): ${endsWithoutPunctuation.length}`);
console.log(`Alternativas terminando com (...): ${optionsWithEllipsis.length}`);
console.log(`mainErrorReason terminando com (...): ${mainErrorWithEllipsis.length}`);
console.log(`takeHomeMessage terminando com (...): ${takeHomeWithEllipsis.length}`);
console.log('\n--- Distribuição de tamanho do finalCommentary ---');
console.log(JSON.stringify(lengthDistribution, null, 2));

console.log(`\n--- LISTA COMPLETA DAS ${endsWithEllipsis.length} QUESTÕES COM RETICÊNCIAS NO FINALCOMMENTARY ---`);
endsWithEllipsis.forEach((item, idx) => {
  console.log(`[${idx + 1}] Code: ${item.code} | ID: ${item.id} | Tamanho: ${item.length} chars`);
  console.log(`     Últimos 120 caracteres: "...${item.fc.slice(-120)}"`);
});

if (endsWithoutPunctuation.length > 0) {
  console.log(`\n--- AMOSTRA DAS QUE TERMINAM SEM PONTUAÇÃO (${endsWithoutPunctuation.length} encontradas) ---`);
  endsWithoutPunctuation.slice(0, 15).forEach((item, idx) => {
    console.log(`[${idx + 1}] Code: ${item.code} | Caractere final: '${item.lastChar}' | Tamanho: ${item.length}`);
    console.log(`     Final: "...${item.fc}"`);
  });
}

