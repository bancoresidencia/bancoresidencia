import { SpecialtyHierarchy } from '@/types';
import { CsvFlashcardPreview } from '@/types/flashcards';
import { normalizeText } from './specialtyMatcher';

/**
 * Determina se um cartão tem profundidade de 'study' (detalhado/conceitual)
 * ou 'review' (direto/rápido/high-yield).
 */
export function getFlashcardDepth(card: {
  front: string;
  back: string;
  comment?: string | null;
  studyDepth?: 'study' | 'review' | 'both' | null;
}): 'study' | 'review' {
  if (card.studyDepth === 'study') return 'study';
  if (card.studyDepth === 'review') return 'review';

  const commentLength = card.comment?.length || 0;
  const frontLength = (card.front || '').length;

  // Palavras indicativas de estudo aprofundado, etiopatogenia ou diagnóstico diferencial
  const hasInDepthKeywords = /mecanismo|fisiopatolog|diagnóstico diferencial|diagnostico diferencial|classificação|classificacao|estadiamento|etiopatogenia|algoritmo|critérios de|criterios de/i.test(
    `${card.front || ''} ${card.comment || ''}`
  );

  // Cards longos ou com justificativas ricas caem em 'study'
  if (commentLength > 140 || frontLength > 170 || hasInDepthKeywords) {
    return 'study';
  }

  return 'review';
}

/**
 * Interface de linha bruta parsed do CSV
 */
export interface RawParsedCsvRow {
  front: string;
  back: string;
  comment?: string;
  specialty?: string;
  theme?: string;
  focus?: string;
  subfocus?: string;
  sub_subfocus?: string;
  subSubfocus?: string;
  deckId?: string;
  priority?: 'essential' | 'standard';
  studyDepth?: 'study' | 'review';
  tags?: string[];
  rawLineIndex: number;
}

/**
 * Limpa tags HTML típicas de exports do Anki
 */
function cleanAnkiHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<div>/gi, '\n')
    .replace(/<\/div>/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<[^>]+>/g, '') // remove tags restantes
    .trim();
}

/**
 * Analisador (Parser) de CSV/TSV RFC 4180 robusto com suporte a aspas e quebras de linha
 */
export function parseFlashcardsCsv(csvContent: string): RawParsedCsvRow[] {
  if (!csvContent || !csvContent.trim()) return [];

  // 1. Detecta o delimitador da primeira linha não-vazia
  const firstLine = csvContent.split(/\r?\n/).find((l) => l.trim().length > 0) || '';
  let delimiter = ',';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  if (tabCount > commaCount && tabCount > semicolonCount) {
    delimiter = '\t';
  } else if (semicolonCount > commaCount) {
    delimiter = ';';
  }

  // 2. Parser de fluxo com suporte a aspas e quebras de linha dentro de campos
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // pula aspa dupla escapada
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // pula \r\n
      }
      currentRow.push(currentField);
      currentField = '';
      if (currentRow.some((field) => field.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some((field) => field.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) return [];

  // 3. Avalia se a primeira linha é um cabeçalho
  const rawHeaders = rows[0].map((h) => normalizeText(h).replace(/[^a-z0-9]/g, ''));
  const isHeaderCandidate = rawHeaders.some((h) =>
    ['frente', 'front', 'pergunta', 'questao', 'card', 'termo', 'perguntaoucloze'].includes(h)
  );

  const headerIndices = {
    front: 0,
    back: 1,
    comment: -1,
    specialty: -1,
    theme: -1,
    focus: -1,
    subfocus: -1,
    deck: -1,
    priority: -1,
    studyDepth: -1,
    tags: -1
  };

  let startIndex = 0;

  if (isHeaderCandidate) {
    startIndex = 1;
    rawHeaders.forEach((col, idx) => {
      if (['frente', 'front', 'pergunta', 'questao', 'card', 'termo', 'enunciado'].includes(col)) {
        headerIndices.front = idx;
      } else if (['verso', 'back', 'resposta', 'gabarito', 'definicao'].includes(col)) {
        headerIndices.back = idx;
      } else if (['comentario', 'comment', 'explicacao', 'justificativa', 'armadilha', 'obs'].includes(col)) {
        headerIndices.comment = idx;
      } else if (['especialidade', 'specialty', 'area', 'materia'].includes(col)) {
        headerIndices.specialty = idx;
      } else if (['tema', 'theme', 'topico', 'assunto'].includes(col)) {
        headerIndices.theme = idx;
      } else if (['foco', 'focus', 'subtema', 'capitulo'].includes(col)) {
        headerIndices.focus = idx;
      } else if (['subfoco', 'subfocus'].includes(col)) {
        headerIndices.subfocus = idx;
      } else if (['deck', 'baralho', 'deckid'].includes(col)) {
        headerIndices.deck = idx;
      } else if (['prioridade', 'priority', 'essencial'].includes(col)) {
        headerIndices.priority = idx;
      } else if (['modo', 'profundidade', 'studydepth', 'depth'].includes(col)) {
        headerIndices.studyDepth = idx;
      } else if (['tags', 'etiquetas', 'marcadores'].includes(col)) {
        headerIndices.tags = idx;
      }
    });
  } else {
    // Se não tiver cabeçalho explícito, assume:
    // col 0 = frente, col 1 = verso, col 2 = comentário (se houver), col 3 = tags
    startIndex = 0;
    headerIndices.front = 0;
    headerIndices.back = 1;
    if (rows[0].length >= 3) headerIndices.comment = 2;
    if (rows[0].length >= 4) headerIndices.tags = 3;
  }

  const results: RawParsedCsvRow[] = [];

  for (let r = startIndex; r < rows.length; r++) {
    const row = rows[r];
    const frontRaw = row[headerIndices.front] || '';
    const backRaw = row[headerIndices.back] || '';

    const front = cleanAnkiHtml(frontRaw);
    const back = cleanAnkiHtml(backRaw);

    // Se estiver vazio tanto a frente quanto o verso, ignora linha
    if (!front && !back) continue;

    const comment = headerIndices.comment >= 0 ? cleanAnkiHtml(row[headerIndices.comment] || '') : undefined;
    const specialty = headerIndices.specialty >= 0 ? row[headerIndices.specialty]?.trim() : undefined;
    const theme = headerIndices.theme >= 0 ? row[headerIndices.theme]?.trim() : undefined;
    const focus = headerIndices.focus >= 0 ? row[headerIndices.focus]?.trim() : undefined;
    const subfocus = headerIndices.subfocus >= 0 ? row[headerIndices.subfocus]?.trim() : undefined;
    const deckId = headerIndices.deck >= 0 ? row[headerIndices.deck]?.trim() : undefined;

    let priority: 'essential' | 'standard' | undefined = undefined;
    if (headerIndices.priority >= 0) {
      const pRaw = normalizeText(row[headerIndices.priority] || '');
      if (pRaw.includes('essencial') || pRaw.includes('alta') || pRaw === '1' || pRaw === 'true') {
        priority = 'essential';
      } else if (pRaw) {
        priority = 'standard';
      }
    }

    let studyDepth: 'study' | 'review' | undefined = undefined;
    if (headerIndices.studyDepth >= 0) {
      const dRaw = normalizeText(row[headerIndices.studyDepth] || '');
      if (dRaw.includes('revis') || dRaw === 'rapido') {
        studyDepth = 'review';
      } else if (dRaw.includes('estud') || dRaw === 'detalhado') {
        studyDepth = 'study';
      }
    }

    let tags: string[] = [];
    if (headerIndices.tags >= 0 && row[headerIndices.tags]) {
      tags = row[headerIndices.tags]
        .split(/[,;\s]+/)
        .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
        .filter(Boolean);
    }

    results.push({
      front,
      back: back || (front.includes('{{c') ? 'Oclusão Cloze' : ''),
      comment: comment || undefined,
      specialty: specialty || undefined,
      theme: theme || undefined,
      focus: focus || undefined,
      subfocus: subfocus || undefined,
      deckId: deckId || undefined,
      priority,
      studyDepth,
      tags: tags.length > 0 ? tags : undefined,
      rawLineIndex: r + 1
    });
  }

  return results;
}

/**
 * Classificador semântico inteligente para distribuir flashcards automaticamente na hierarquia clínica
 */
export function classifyCardDistribution(
  card: {
    front: string;
    back: string;
    comment?: string;
    tags?: string[];
  },
  hierarchy: SpecialtyHierarchy[],
  manualTarget?: {
    specialty?: string;
    theme?: string;
    focus?: string;
    subfocus?: string;
    subSubfocus?: string;
  }
): {
  specialty: string;
  theme: string;
  focus: string;
  subfocus?: string;
  subSubfocus?: string;
  confidence: number;
  isManual: boolean;
} {
  const manualSpec =
    manualTarget?.specialty && manualTarget.specialty !== 'auto'
      ? manualTarget.specialty
      : undefined;
  const manualTema =
    manualTarget?.theme && manualTarget.theme !== 'auto'
      ? manualTarget.theme
      : undefined;
  const manualFoco =
    manualTarget?.focus && manualTarget.focus !== 'auto'
      ? manualTarget.focus
      : undefined;
  const manualSubfoco =
    manualTarget?.subfocus && manualTarget.subfocus !== 'auto'
      ? manualTarget.subfocus
      : undefined;
  const manualSubSubfoco =
    manualTarget?.subSubfocus && manualTarget.subSubfocus !== 'auto'
      ? manualTarget.subSubfocus
      : undefined;

  // 1. Se todos os 3 níveis foram especificados manualmente
  if (manualSpec && manualTema && manualFoco) {
    return {
      specialty: manualSpec,
      theme: manualTema,
      focus: manualFoco,
      subfocus: manualSubfoco,
      subSubfocus: manualSubSubfoco,
      confidence: 100,
      isManual: true
    };
  }

  // 2. Classificação Automática com restrição opcional até o nível fixado pelo usuário
  const fullText = normalizeText(
    `${card.front} ${card.back} ${card.comment || ''} ${(card.tags || []).join(' ')}`
  );

  // Filtra hierarquia de busca se o usuário fixou Especialidade ou Tema
  let searchHierarchy = hierarchy;
  if (manualSpec) {
    const specTarget = normalizeText(manualSpec);
    const specNode = hierarchy.find((s) => {
      const normS = normalizeText(s.especialidade);
      if (specTarget.includes('cirurgia')) return normS.includes('cirurgia');
      return normS === specTarget || normS.includes(specTarget) || specTarget.includes(normS);
    });
    if (specNode) {
      searchHierarchy = [specNode];
    }
  }

  if (manualTema && searchHierarchy.length > 0) {
    const temaTarget = normalizeText(manualTema);
    const narrowed = searchHierarchy
      .map((s) => ({
        ...s,
        temas: s.temas.filter((t) => {
          const normT = normalizeText(t.tema);
          return normT === temaTarget || normT.includes(temaTarget) || temaTarget.includes(normT);
        })
      }))
      .filter((s) => s.temas.length > 0);

    if (narrowed.length > 0) {
      searchHierarchy = narrowed;
    }
  }

  let bestSpec = manualSpec || searchHierarchy[0]?.especialidade || 'Clínica Médica';
  let bestTema = manualTema || searchHierarchy[0]?.temas[0]?.tema || 'Geral';
  let bestFoco = manualFoco || searchHierarchy[0]?.temas[0]?.focos[0]?.foco || 'Clínica Geral';
  let bestSubfoco: string | undefined = undefined;
  let bestSubSubfoco: string | undefined = undefined;
  let highestScore = 0;

  // Dicionário de peso para termos de alta especificidade (âncoras clínicas)
  const SPECIALTY_ANCHORS: Record<string, string[]> = {
    Ginecologia: [
      'cancer de colo', 'colo uterino', 'cervical', 'hpv', 'citologia', 'papanicolau', 'asc-us',
      'liebg', 'lieag', 'hsil', 'lsil', 'colposcopia', 'conizacao', 'leep', 'caf', 'nic 1', 'nic 2', 'nic 3',
      'sua', 'sangramento uterino anormal', 'palin-coein', 'palm coein', 'mioma', 'leiomioma', 'endometriose',
      'sop', 'policistico', 'climaterio', 'menopausa', 'terapia hormonal', 'vulvovaginite', 'candidíase',
      'tricomoniase', 'vaginose bacteriana', 'dip', 'doenca inflamatoria pelvica', 'bartholinite', 'mastologia'
    ],
    Obstetrícia: [
      'pre-natal', 'preeclampsia', 'pre-eclampsia', 'eclampsia', 'sulfato de magnesio', 'parto',
      'partograma', 'trabalho de parto', 'distocia', 'puerperio', 'hemorragia pos-parto', 'dpp',
      'descolamento prematuro', 'placenta previa', 'rotura prematura', 'rpm', 'vitalidade fetal',
      'cardiotocografia', 'ctg', 'dopplerfluxometria', 'indice de liquido amniotico', 'ila', 'abortamento',
      'gestacao ectopica', 'mola hidatiforme', 'incompatibilidade rh', 'coombs indireto'
    ],
    Pediatria: [
      'recem-nascido', 'neonato', 'neonatal', 'apgar', 'reanimacao neonatal', 'ictericia neonatal',
      'fototerapia', 'zona de kramer', 'bronquiolite', 'virus sincicial', 'laringite', 'estridor',
      'asma infantil', 'pni', 'calendario vacinal', 'marcos do desenvolvimento', 'desidratacao infantil',
      'diarreia aguda', 'reidratacao oral', 'trofopatia', 'desnutricao', 'kwashiorkor', 'marasma',
      'exantematica', 'sarampo', 'varicela', 'escarlatina', 'eritema infeccioso', 'doenca de kawasaki'
    ],
    'Cirurgia Geral': [
      'atls', 'trauma', 'via aerea cirurgica', 'cricotireoidostomia', 'intubacao orotraqueal',
      'pneumotorax hipertensivo', 'drenagem toracica', 'hemotorax macico', 'tamponamento cardiaco',
      'choque hipovolemico', 'abdome agudo', 'apendicite', 'escore de alvarado', 'colecistite',
      'sinal de murphy', 'pancreatite aguda', 'obstrucao intestinal', 'volvo de sigmoide', 'diverticulite',
      'hernia inguinal', 'lichtenstein', 'hernia crural', 'queimadura', 'formula de parkland'
    ],
    'Medicina Preventiva e Social': [
      'sus', 'sistema unico de saude', 'lei 8080', 'lei 8142', 'nob', 'noas', 'atencao primaria',
      'estrategia saude da familia', 'esf', 'vigilancia epidemiologica', 'notificacao compulsoria',
      'sensibilidade', 'especificidade', 'vpp', 'vpn', 'razao de verossimilhanca', 'estudo de coorte',
      'caso-controle', 'ensaio clinico randomizado', 'viés', 'fator de confusao', 'bioetica', 'saude do trabalhador'
    ],
    'Clínica Médica': [
      'hipertensao arterial', 'has', 'diabetes mellitus', 'cetoacidose diabetica', 'estado hiperosmolar',
      'infarto agudo do miocardio', 'iam', 'supra de st', 'insuficiencia cardiaca', 'fracao de ejecao',
      'fibrilacao atrial', 'anticoagulacao', 'cha2ds2-vasc', 'pneumonia adquirida', 'curb-65',
      'dpoc', 'gold', 'asma', 'gina', 'injuria renal aguda', 'kdigo', 'doenca renal cronica',
      'avc isquemico', 'trombolise', 'tromboembolismo pulmonar', 'tep', 'criterios de wells',
      'sepse', 'sofa', 'choque septico', 'hiv', 'tarv', 'tuberculose', 'esquema ripe'
    ]
  };

  // Pontuação inicial por palavras-chave ancoradas
  const specScores: Record<string, number> = {};
  for (const [spec, anchors] of Object.entries(SPECIALTY_ANCHORS)) {
    let score = 0;
    for (const anchor of anchors) {
      if (fullText.includes(anchor)) {
        score += anchor.length > 8 ? 6 : 4;
      }
    }
    specScores[spec] = score;
  }

  // Percorre a árvore clínica canônica do Banco Residência (restringida se o usuário fixou níveis)
  searchHierarchy.forEach((specNode) => {
    const specName = specNode.especialidade;
    const baseSpecBonus = specScores[specName] || 0;

    specNode.temas.forEach((temaNode) => {
      const normTema = normalizeText(temaNode.tema);
      const temaWords = normTema.split(/\s+/).filter((w) => w.length > 3);
      let temaScore = baseSpecBonus;

      if (fullText.includes(normTema)) {
        temaScore += 15;
      } else {
        temaWords.forEach((tw) => {
          if (fullText.includes(tw)) temaScore += 3;
        });
      }

      temaNode.focos.forEach((focoNode) => {
        const normFoco = normalizeText(focoNode.foco);
        const focoWords = normFoco.split(/\s+/).filter((w) => w.length > 3);
        let focoScore = temaScore;

        if (fullText.includes(normFoco)) {
          focoScore += 25;
        } else {
          focoWords.forEach((fw) => {
            if (fullText.includes(fw)) focoScore += 4;
          });
        }

        // Subfocos e Sub-subfocos se houver
        let matchedSubfoco: string | undefined = manualSubfoco;
        let matchedSubSubfoco: string | undefined = manualSubSubfoco;
        focoNode.subfocos?.forEach((sub) => {
          const subName = typeof sub === 'string' ? sub : sub.subfoco;
          const normSub = normalizeText(subName);
          if (fullText.includes(normSub)) {
            focoScore += 10;
            if (!matchedSubfoco) matchedSubfoco = subName;
          }

          if (typeof sub !== 'string' && sub.sub_subfocos) {
            sub.sub_subfocos.forEach((ss) => {
              const normSS = normalizeText(ss);
              if (fullText.includes(normSS)) {
                focoScore += 14;
                if (!matchedSubfoco) matchedSubfoco = subName;
                if (!matchedSubSubfoco) matchedSubSubfoco = ss;
              }
            });
          }
        });

        if (focoScore > highestScore) {
          highestScore = focoScore;
          bestSpec = specName;
          bestTema = temaNode.tema;
          bestFoco = focoNode.foco;
          bestSubfoco = matchedSubfoco;
          bestSubSubfoco = matchedSubSubfoco;
        }
      });
    });
  });

  // Cálculo da confiança estimada (0 a 100)
  const confidence = Math.min(Math.round((highestScore / 35) * 100), 99);

  return {
    specialty: manualSpec || bestSpec,
    theme: manualTema || bestTema,
    focus: manualFoco || bestFoco,
    subfocus: manualSubfoco || bestSubfoco,
    subSubfocus: manualSubSubfoco || bestSubSubfoco,
    confidence: confidence >= 15 ? confidence : 15,
    isManual: Boolean(manualSpec || manualTema || manualFoco)
  };
}

/**
 * Converte linhas parsed em objetos de preview validados prontos para edição
 */
export function buildFlashcardPreviews(
  rows: RawParsedCsvRow[],
  hierarchy: SpecialtyHierarchy[],
  distributionMode: 'auto' | 'manual',
  manualTarget?: {
    specialty?: string;
    theme?: string;
    focus?: string;
    subfocus?: string;
    subSubfocus?: string;
  },
  defaultDeckId: string = 'deck-padrao'
): CsvFlashcardPreview[] {
  return rows.map((row, idx) => {
    const isCloze = row.front.includes('{{c') && row.front.includes('}}');
    let isValid = true;
    let validationError: string | undefined = undefined;

    if (!row.front.trim()) {
      isValid = false;
      validationError = 'Frente do cartão não pode ser vazia.';
    } else if (!isCloze && !row.back.trim()) {
      isValid = false;
      validationError = 'Verso não pode ser vazio para cartões sem oclusão cloze.';
    }

    // Se a linha já traz especialidade e foco explícitos, prioriza
    let finalSpec = row.specialty;
    let finalTema = row.theme;
    let finalFoco = row.focus;
    let finalSubfoco = row.subfocus;
    let finalSubSubfoco = row.subSubfocus || row.sub_subfocus;
    let confidence = 95;

    if (!finalSpec || !finalTema || !finalFoco || distributionMode === 'manual') {
      const classified = classifyCardDistribution(
        row,
        hierarchy,
        distributionMode === 'manual' ? manualTarget : undefined
      );
      finalSpec = classified.specialty;
      finalTema = classified.theme;
      finalFoco = classified.focus;
      finalSubfoco = classified.subfocus;
      finalSubSubfoco = classified.subSubfocus;
      confidence = classified.confidence;
    }

    const calculatedDepth = row.studyDepth || getFlashcardDepth(row);

    return {
      id: `fc-import-temp-${idx}-${Date.now()}`,
      front: row.front,
      back: row.back || (isCloze ? 'Cloze' : ''),
      comment: row.comment,
      specialty: finalSpec,
      theme: finalTema,
      focus: finalFoco,
      subfocus: finalSubfoco,
      sub_subfocus: finalSubSubfoco,
      subSubfocus: finalSubSubfoco,
      deckId: row.deckId || defaultDeckId,
      priority: row.priority || 'standard',
      studyDepth: calculatedDepth,
      tags: row.tags || [],
      isValid,
      validationError,
      confidence,
      distributionMode
    };
  });
}

