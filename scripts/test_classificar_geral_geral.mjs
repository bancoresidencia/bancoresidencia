import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const rawTree = JSON.parse(fs.readFileSync('data/catalogo_arvore_canonica_completa.json', 'utf8'));

// Pegar focos de Pediatria
const pedHierarchy = rawTree.hierarquia_padrao.find(e => e.especialidade === 'Pediatria');
const taxonomyChoices = [];
for (const t of pedHierarchy.temas) {
  for (const f of t.focos) {
    const subfocos = (f.subfocos || []).map(s => typeof s === 'string' ? s : s.subfoco).filter(Boolean);
    taxonomyChoices.push({
      tema: t.tema,
      foco: f.foco,
      subfocos
    });
  }
}

// Ler 5 questões de Pediatria com Tema=Geral e Foco=Geral
const lines = fs.readFileSync('data/quarentena_remanescentes_4552.jsonl', 'utf8').trim().split('\n');
const sample = [];
for (const l of lines) {
  try {
    const item = JSON.parse(l);
    if (item.especialidade === 'Pediatria' && (item.foco || '').toLowerCase() === 'geral') {
      sample.push({
        id: item.id,
        code: item.code,
        enunciado: (item.statement || '').slice(0, 600),
        alternativas: (item.options || '').slice(0, 400),
        gabarito: item.correct_answer,
        comentario: (item.commentary || '').slice(0, 300)
      });
      if (sample.length >= 5) break;
    }
  } catch {}
}

console.log('Sample size:', sample.length);

const prompt = `Você é um Professor e Preceptor Médico de Residência Médica da plataforma Banco Residência.
Classifique o LOTE DE QUESTÕES DE PEDIATRIA na árvore taxonômica oficial.

OPÇÕES TAXONÔMICAS VÁLIDAS DE PEDIATRIA:
${JSON.stringify(taxonomyChoices, null, 2)}

QUESTÕES PARA CLASSIFICAR:
${JSON.stringify(sample, null, 2)}

RESPONDA ESTRITAMENTE EM FORMATO JSON:
[
  {
    "id": "ID_EXATO",
    "tema": "NOME_EXATO_DO_TEMA",
    "foco": "NOME_EXATO_DO_FOCO",
    "subfoco": "NOME_EXATO_DO_SUBFOCO",
    "justificativa_clinica": "Justificativa concisa em 1 frase."
  }
]`;

console.log('Enviando para Gemini 3.1 Flash Lite...');
const t0 = Date.now();
const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${env.GEMINI_API_KEY}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' }
  })
});

console.log('Status:', res.status, 'Time:', ((Date.now() - t0)/1000).toFixed(1) + 's');
const data = await res.json();
console.log(data?.candidates?.[0]?.content?.parts?.[0]?.text);

