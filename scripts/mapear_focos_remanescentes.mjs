import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const rawTree = JSON.parse(fs.readFileSync('data/catalogo_arvore_canonica_completa.json', 'utf8'));
const cirurgiaFocos = [];
for (const esp of rawTree.hierarquia_padrao) {
  if (esp.especialidade === 'Cirurgia Geral') {
    for (const t of esp.temas) {
      for (const f of t.focos) {
        cirurgiaFocos.push({ tema: t.tema, foco: f.foco });
      }
    }
  }
}

const sampleNonCanonical = [
  'Inflamação Aguda do Pâncreas',
  'Colecistolitíase',
  'Hérnias abdominais, femorais, umbilicais e inguinais',
  'Neoplasias Colorretais',
  'Metabolismo e Nutrição Cirúrgica',
  'Fundamentos Anatômicos',
  'Doenças do Esôfago e Estômago',
  'Apendicite Aguda e Complicações',
  'Trauma Abdominal Fechado'
];

const prompt = `Você é um Médico Especialista em Taxonomia de Residência Médica.
Mapeie cada FOCO NÃO-CANÔNICO para o FOCO CANÔNICO oficial mais adequado.

LISTA DE FOCOS OFICIAIS DE CIRURGIA GERAL:
${JSON.stringify(cirurgiaFocos.map(c => c.foco), null, 2)}

FOCOS NÃO-CANÔNICOS:
${JSON.stringify(sampleNonCanonical, null, 2)}

RESPONDA ESTRITAMENTE EM JSON:
[
  {
    "foco_original": "Nome original",
    "foco_canonico": "Nome exato da lista oficial"
  }
]`;

const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${env.GEMINI_API_KEY}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' }
  })
});
const data = await res.json();
console.log(data?.candidates?.[0]?.content?.parts?.[0]?.text);

