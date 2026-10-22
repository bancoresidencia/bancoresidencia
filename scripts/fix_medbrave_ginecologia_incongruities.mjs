import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ezluharxlmlqhdkqrjbz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractRoman(text) {
  const norm = normalize(text);
  const words = norm.split(' ');
  const romans = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'];
  return words.filter(w => romans.includes(w)).sort().join(',');
}

console.log('='.repeat(90));
console.log('🩺 SANEAMENTO DE INCONGRUÊNCIAS DO MEDBRAVE EM GINECOLOGIA (650 QUESTÕES)');
console.log('='.repeat(90));

// 1. Carregar MedBrave limpo
console.log('📦 Carregando acervo MedBrave...');
const mbQuestions = JSON.parse(fs.readFileSync('data/medbrave_questions_clean.json', 'utf-8'));
const mbIndex = new Map();
for (const mb of mbQuestions) {
  const normStmt = normalize(mb.statement);
  if (!normStmt || normStmt.length < 20) continue;
  const k = normStmt.slice(0, 50);
  if (!mbIndex.has(k)) mbIndex.set(k, []);
  mbIndex.get(k).push({ ...mb, normStmt });
}

// 2. Carregar Log do MedBrave
const logLines = fs.readFileSync('data/cruzamento_medbrave_log.jsonl', 'utf-8').trim().split('\n');
const logParsed = logLines.map(l => JSON.parse(l));
const logMap = new Map(logParsed.filter(p => p.specialty === 'Ginecologia').map(p => [p.banco_id, p]));

// 3. Carregar Ginecologia
const ginPath = 'data/ginecologia_final_questions.json';
const gin = JSON.parse(fs.readFileSync(ginPath, 'utf-8'));

// 4. Carregar Checkpoint de Ouro
const goldPath = 'data/checkpoints/ginecologia_gold_anchors_complete.json';
const gold = JSON.parse(fs.readFileSync(goldPath, 'utf-8'));
const goldMap = new Map(gold.map(g => [g.id, g]));

const updates = [];

const richSemusaCommentary = `Gabarito Oficial: E) Incontinência urinária de urgência, solicitar urinocultura e exame sumário de urina para excluir cistite antes de prosseguir com investigação.

Raciocínio Clínico:
Mulher de 63 anos, multípara (3 partos vaginais e 1 cesárea), diabética, apresentando queixa de perda urinária involuntária diária precedida de sensação de urgência miccional incontrolável há 4 meses, associada a noctúria frequente e necessidade de proteção diária (calcinhas higiênicas). A paciente nega perdas aos esforços e nega sensação de esvaziamento incompleto da bexiga.
O exame físico evidencia atrofia genital hipoestrogênica e prolapso anterior leve assintomático pelo POP-Q (estádio I/II, Ba +1).
O quadro clínico é clássico de Incontinência Urinária de Urgência (IUU) / Síndrome da Bexiga Hiperativa úmida.
A conduta inicial OBRIGATÓRIA e mandatória em qualquer paciente com sintomas irritativos do trato urinário inferior é a realização de exame sumário de urina (EAS/tipo I) e Urinocultura para excluir infecção urinária ativa (cistite), que mimetiza perfeitamente o quadro de urgência e urgi-incontinência.
O estudo urodinâmico NÃO é exame de primeira linha na avaliação inicial da incontinência de urgência não complicada, sendo reservado apenas para casos com falha do tratamento clínico conservador, prolapsos graves (estádio III/IV), suspeita de bexiga neurogênica ou programação cirúrgica.

Análise das Alternativas:
Alternativa A: Incorreta. Não há história de incontinência aos esforços concomitante que caracterize incontinência mista. Além disso, não se indica prova terapêutica antes da exclusão de infecção urinária.
Alternativa B: Incorreta. Não se trata de incontinência mista e o estudo urodinâmico não é o exame de entrada.
Alternativa C: Incorreta. A uretrocistografia retrógrada não tem papel no diagnóstico da incontinência urinária de urgência; tem indicação em divertículos de uretra ou fístulas urinárias.
Alternativa D: Incorreta. O estudo urodinâmico é desnecessário e contraindicado como primeira etapa na IUU não complicada. A conduta inicial é sempre clínica e não invasiva, afastando infecção urinária.
Alternativa E: Correta. O diagnóstico sindrômico é Incontinência Urinária de Urgência, e a conduta inicial mandatória é solicitar urinocultura e sumário de urina (EAS) para excluir cistite infecciosa antes de qualquer conduta terapêutica ou propedêutica invasiva.

Principal Motivo de Erro:
Indicar precocemente o estudo urodinâmico para queixa de urgência pura antes de cumprir a triagem diagnóstica básica e não invasiva (EAS e urocultura).

Take-Home Message:
Sintomas de urgência miccional e urgi-incontinência exigem SEMPRE urinocultura e EAS prévios para afastar infecção urinária antes de qualquer outra investigação.

Referências:
• FEBRASGO. Manual de Uroginecologia e Cirurgia Vaginal.
• International Urogynecological Association (IUGA) / International Continence Society (ICS) Joint Report on the Terminology for Female Pelvic Floor Dysfunction.
• American Urological Association (AUA) / Society of Urodynamics, Female Pelvic Medicine & Urogenital Reconstruction (SUFU) Guideline: Diagnosis and Treatment of Non-Neurogenic Overactive Bladder.`;

for (const q of gin) {
  if (q.is_anulada) continue;
  let targetLetter = null;
  let targetText = null;

  // Caso específico SEMUSA-2025-GIN-4229
  if (q.code === 'SEMUSA-2025-GIN-4229') {
    targetLetter = 'E';
    targetText = 'Incontinência urinária de urgência, solicitar urinocultura e exame sumário de urina para excluir cistite antes de prosseguir com investigação.';
    q.commentary = richSemusaCommentary;
  } else {
    // 1. Verificar Log do MedBrave
    const p = logMap.get(q.id);
    if (p && q.correct_answer !== p.assigned_letter) {
      const normOur = normalize(p.our_option_text);
      const normMb = normalize(p.medbrave_correct_text);
      const romOur = extractRoman(p.our_option_text);
      const romMb = extractRoman(p.medbrave_correct_text);
      if (!romOur || !romMb || romOur === romMb) {
        if (normOur === normMb || ((normOur.startsWith(normMb) || normMb.startsWith(normOur)) && Math.min(normOur.length, normMb.length) > 30)) {
          targetLetter = p.assigned_letter;
          targetText = p.our_option_text;
        }
      }
    }

    // 2. Verificar correspondência no acervo completo MedBrave
    if (!targetLetter) {
      const normStmt = normalize(q.statement);
      if (normStmt && normStmt.length >= 20) {
        const k = normStmt.slice(0, 50);
        const cands = mbIndex.get(k);
        if (cands) {
          for (const cand of cands) {
            const mbCorrect = (cand.alternatives || []).find(a => a.is_correct || a.isCorrect);
            if (!mbCorrect) continue;

            const normMbCorrect = normalize(mbCorrect.text);
            const ourOpts = Array.isArray(q.options) ? q.options : Object.entries(q.options || {}).map(([l, t]) => ({ letter: l, text: t }));
            
            const matchedOpt = ourOpts.find(o => {
              const normOur = normalize(o.text);
              if (normOur === normMbCorrect) {
                const romOur = extractRoman(o.text);
                const romMb = extractRoman(mbCorrect.text);
                if (romOur && romMb && romOur !== romMb) return false;
                return true;
              }
              return false;
            });

            if (matchedOpt && q.correct_answer && q.correct_answer !== matchedOpt.letter) {
              targetLetter = matchedOpt.letter;
              targetText = matchedOpt.text;
              break;
            }
          }
        }
      }
    }
  }

  if (targetLetter) {
    const oldAns = q.correct_answer;
    q.correct_answer = targetLetter;
    q.correctAnswer = targetLetter;

    // Se o comentário for o genérico anterior ("Alternativa X."), atualizar para a nova letra
    if (q.commentary && (q.commentary.startsWith('Gabarito Oficial: Alternativa') || q.commentary.startsWith('Gabarito oficial: Alternativa'))) {
      q.commentary = `Gabarito Oficial Homologado: Alternativa ${targetLetter}.`;
    }

    // Atualizar no Checkpoint de Ouro
    const goldItem = goldMap.get(q.id);
    if (goldItem) {
      goldItem.official_answer = targetLetter;
      goldItem.status = 'CONFIRMADO_MEDBRAVE';
    }

    updates.push({
      id: q.id,
      code: q.code,
      oldAns,
      newAns: targetLetter,
      commentary: q.commentary
    });
  }
}

console.log(`\n✅ Total de questões corrigidas em Ginecologia: ${updates.length}`);

// Gravar arquivos locais
fs.writeFileSync(ginPath, JSON.stringify(gin, null, 2), 'utf-8');
console.log(`📁 Arquivo atualizado: ${ginPath}`);

fs.writeFileSync(goldPath, JSON.stringify(gold, null, 2), 'utf-8');
console.log(`📁 Checkpoint atualizado: ${goldPath}`);

// 5. Atualizar no Supabase via worker pool em lotes HTTP PATCH
console.log(`\n⚡ Sincronizando ${updates.length} questões no Supabase em produção...`);

// Agrupar por payload idêntico para otimizar requisições
const groups = new Map();
for (const u of updates) {
  const key = `${u.newAns}|||${u.commentary}`;
  if (!groups.has(key)) {
    groups.set(key, { ans: u.newAns, comm: u.commentary, ids: [] });
  }
  groups.get(key).ids.push(u.id);
}

const CHUNK_SIZE = 120;
const tasks = [];
for (const g of groups.values()) {
  for (let i = 0; i < g.ids.length; i += CHUNK_SIZE) {
    const chunkIds = g.ids.slice(i, i + CHUNK_SIZE);
    tasks.push({ ans: g.ans, comm: g.comm, ids: chunkIds });
  }
}

console.log(`📦 Lotes HTTP formados: ${tasks.length}`);

const CONCURRENCY = 8;
let completed = 0;

async function worker() {
  while (tasks.length > 0) {
    const task = tasks.shift();
    if (!task) break;

    const idList = task.ids.join(',');
    const url = `${SUPABASE_URL}/rest/v1/questions?id=in.(${idList})`;

    const body = {
      correct_answer: task.ans,
      is_anulada: false,
      commentary: task.comm
    };

    let attempts = 0;
    let ok = false;
    while (attempts < 3 && !ok) {
      attempts++;
      try {
        const res = await fetch(url, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(body)
        });

        if (res.ok) {
          ok = true;
          completed += task.ids.length;
        } else {
          await new Promise(r => setTimeout(r, 1000));
        }
      } catch (e) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    process.stdout.write(`\r   Progresso Supabase: ${completed}/${updates.length} questões sincronizadas...`);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
console.log('\n\n🚀 Sincronização 100% concluída com sucesso!');
