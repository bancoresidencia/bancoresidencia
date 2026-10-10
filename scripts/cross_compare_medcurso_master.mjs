import fs from 'fs';
import path from 'path';

const BASE_DIR = process.cwd();
const MED_DIR = path.join(BASE_DIR, 'data', 'knowledge', 'extracao_de_questoes');

function norm(s) {
  if (!s) return '';
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 1. Carrega todas as questões da Plataforma
console.log('📦 Carregando base da Plataforma...');
const platExams = new Set();
const platStatements = new Set();
const goldPath = path.join(BASE_DIR, 'data', 'all_homologated_questions_gold.json');

if (fs.existsSync(goldPath)) {
  try {
    const gold = JSON.parse(fs.readFileSync(goldPath, 'utf8'));
    for (const q of gold) {
      if (q.exam_id && q.question_number) {
        platExams.add(`${norm(q.exam_id)}_${q.question_number}`);
      }
      const st = norm(q.enunciado || q.statement || '');
      if (st.length > 30) {
        platStatements.add(st.slice(0, 70));
      }
    }
  } catch {}
}
console.log(`   • Plataforma: ${platExams.size} exames+questões / ${platStatements.size} enunciados indexados`);

// 2. Carrega Extração 1 (3.206 questões)
console.log('📦 Carregando Base da 1ª Extração...');
const e1Statements = new Set();
const k1Dir = path.join(BASE_DIR, 'data', 'knowledge');
if (fs.existsSync(k1Dir)) {
  const dirs = fs.readdirSync(k1Dir).filter(d => 
    d !== 'gabarito_das_questoes' && 
    d !== 'extracao_de_questoes' && 
    fs.statSync(path.join(k1Dir, d)).isDirectory()
  );
  for (const d of dirs) {
    const files = fs.readdirSync(path.join(k1Dir, d)).filter(f => f.endsWith('.json'));
    for (const f of files) {
      try {
        const doc = JSON.parse(fs.readFileSync(path.join(k1Dir, d, f), 'utf8'));
        for (const chunk of (doc.chunks || [])) {
          const txt = norm(chunk.content);
          if (txt.length > 50) {
            // Indexa pedaços de 60 chars
            for (let i = 0; i < txt.length - 60; i += 60) {
              e1Statements.add(txt.slice(i, i + 60));
            }
          }
        }
      } catch {}
    }
  }
}
console.log(`   • Base 1: ${e1Statements.size} segmentos de enunciados indexados`);

// 3. Carrega Extração 2 (30.096 questões do Gabarito Master)
console.log('📦 Carregando Base da 2ª Extração (30.096 questões)...');
const e2Statements = new Set();
const k2Dir = path.join(BASE_DIR, 'data', 'knowledge', 'gabarito_das_questoes');
if (fs.existsSync(k2Dir)) {
  const dirs = fs.readdirSync(k2Dir).filter(d => fs.statSync(path.join(k2Dir, d)).isDirectory());
  for (const d of dirs) {
    const files = fs.readdirSync(path.join(k2Dir, d)).filter(f => f.endsWith('.json'));
    for (const f of files) {
      try {
        const doc = JSON.parse(fs.readFileSync(path.join(k2Dir, d, f), 'utf8'));
        for (const chunk of (doc.chunks || [])) {
          const txt = norm(chunk.content);
          if (txt.length > 50) {
            for (let i = 0; i < txt.length - 60; i += 60) {
              e2Statements.add(txt.slice(i, i + 60));
            }
          }
        }
      } catch {}
    }
  }
}
console.log(`   • Base 2: ${e2Statements.size} segmentos de enunciados indexados`);

// 4. Analisa e compara cada uma das 1.967 questões extraídas do MEDCURSO
console.log('\n🔍 Analisando as 1.967 questões do MEDCURSO 2026...');

let totalQuestoes = 0;
let jaNaExtracao1 = 0;
let jaNaExtracao2 = 0;
let jaNaPlataforma = 0;
let novasParaPlataforma = 0;

const porEspecialidade = {};
const amostraNovas = [];
const amostraCoincidentes = [];

for (const spec of fs.readdirSync(MED_DIR)) {
  const specPath = path.join(MED_DIR, spec);
  if (!fs.statSync(specPath).isDirectory()) continue;

  porEspecialidade[spec] = {
    total: 0,
    naExtracao1: 0,
    naExtracao2: 0,
    naPlataforma: 0,
    novas: 0
  };

  for (const file of fs.readdirSync(specPath)) {
    if (!file.endsWith('.json')) continue;
    const filePath = path.join(specPath, file);
    try {
      const doc = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let modified = false;

      for (const q of (doc.questoes || [])) {
        totalQuestoes++;
        porEspecialidade[spec].total++;

        // Extrai texto limpo do enunciado
        let rawTexto = q.texto || '';
        // Se veio do json data-search
        const matchEnunciado = rawTexto.match(/&quot;texto&quot;:\s*&quot;(.*?)&quot;/);
        if (matchEnunciado) {
          rawTexto = matchEnunciado[1];
        }

        const normTexto = norm(rawTexto);
        const sub1 = normTexto.slice(0, 60);
        const sub2 = normTexto.slice(20, 80);

        let match1 = false;
        let match2 = false;
        let matchPlat = false;

        // Compara com Base 1
        if (sub1.length >= 40 && e1Statements.has(sub1)) match1 = true;
        else if (sub2.length >= 40 && e1Statements.has(sub2)) match1 = true;

        // Compara com Base 2
        if (sub1.length >= 40 && e2Statements.has(sub1)) match2 = true;
        else if (sub2.length >= 40 && e2Statements.has(sub2)) match2 = true;

        // Compara com Plataforma
        if (sub1.length >= 40 && platStatements.has(sub1)) matchPlat = true;
        const qNumMatch = rawTexto.match(/(?:quest[aã]o|q)\s*[:\s-]*(\d+)/i);
        if (q.banca && qNumMatch) {
          const bancaKey = norm(q.banca);
          const num = qNumMatch[1];
          for (const pe of platExams) {
            if (pe.includes(bancaKey) && pe.endsWith(`_${num}`)) {
              matchPlat = true;
              break;
            }
          }
        }

        q.presenteNaExtracao1 = match1;
        q.presenteNaExtracao2 = match2;
        q.presenteNaPlataforma = matchPlat;
        q.novaParaPlataforma = !matchPlat;
        modified = true;

        if (match1) { jaNaExtracao1++; porEspecialidade[spec].naExtracao1++; }
        if (match2) { jaNaExtracao2++; porEspecialidade[spec].naExtracao2++; }
        if (matchPlat) { jaNaPlataforma++; porEspecialidade[spec].naPlataforma++; }
        if (!matchPlat) {
          novasParaPlataforma++;
          porEspecialidade[spec].novas++;
          if (amostraNovas.length < 5) {
            amostraNovas.push({
              especialidade: spec,
              banca: q.banca,
              trecho: rawTexto.slice(0, 150)
            });
          }
        } else {
          if (amostraCoincidentes.length < 5) {
            amostraCoincidentes.push({
              especialidade: spec,
              banca: q.banca,
              trecho: rawTexto.slice(0, 150)
            });
          }
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(doc, null, 2), 'utf8');
      }
    } catch {}
  }
}

// Atualiza o medcurso_extraction_status.json
const statusPath = path.join(BASE_DIR, 'data', 'medcurso_extraction_status.json');
if (fs.existsSync(statusPath)) {
  try {
    const st = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
    st.questoesOficiaisUnicas = totalQuestoes;
    st.jaNaExtracao1 = jaNaExtracao1;
    st.jaNaExtracao2 = jaNaExtracao2;
    st.jaNaPlataforma = jaNaPlataforma;
    st.novasParaPlataforma = novasParaPlataforma;
    st.updatedAt = new Date().toISOString();
    fs.writeFileSync(statusPath, JSON.stringify(st, null, 2), 'utf8');
  } catch {}
}

const resultado = {
  totalQuestoes,
  jaNaExtracao1,
  jaNaExtracao2,
  jaNaPlataforma,
  novasParaPlataforma,
  porEspecialidade,
  amostraNovas,
  amostraCoincidentes
};

fs.writeFileSync(
  path.join(BASE_DIR, 'data', 'medcurso_comparacao_resultado.json'),
  JSON.stringify(resultado, null, 2),
  'utf8'
);

console.log('\n================================================================');
console.log('📊 RESULTADO DA COMPARAÇÃO CRUZADA SIMULTÂNEA (1.967 QUESTÕES)');
console.log('================================================================');
console.log(`🎯 Total Geral Auditado:               ${totalQuestoes.toLocaleString('pt-BR')} questões`);
console.log(`📕 Presentes na 1ª Extração (Teóricos): ${jaNaExtracao1.toLocaleString('pt-BR')} (${((jaNaExtracao1/totalQuestoes)*100).toFixed(1)}%)`);
console.log(`📗 Presentes na 2ª Extração (Master 30k): ${jaNaExtracao2.toLocaleString('pt-BR')} (${((jaNaExtracao2/totalQuestoes)*100).toFixed(1)}%)`);
console.log(`🏛️ Presentes na Plataforma (Gold):      ${jaNaPlataforma.toLocaleString('pt-BR')} (${((jaNaPlataforma/totalQuestoes)*100).toFixed(1)}%)`);
console.log(`✨ NOVAS PARA A PLATAFORMA (Inéditas):  ${novasParaPlataforma.toLocaleString('pt-BR')} (${((novasParaPlataforma/totalQuestoes)*100).toFixed(1)}%)`);
console.log('================================================================\n');
console.log('Detalhamento por Especialidade:');
console.dir(porEspecialidade, { depth: null });
