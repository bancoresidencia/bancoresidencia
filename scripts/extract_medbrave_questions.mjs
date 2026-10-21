import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'scripts', 'medevo_config.json');
const OUTPUT_FILE = path.join(process.cwd(), 'data', 'medbrave_questions_clean.json');
const OUTPUT_JSONL = path.join(process.cwd(), 'data', 'medbrave_questions_clean.jsonl');

const ORDER_TO_LETTER = ['A', 'B', 'C', 'D', 'E'];

function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch {}
  }
  return {};
}

const config = loadConfig();
const token = process.env.MEDBRAVE_USER_TOKEN || config.MEDBRAVE_USER_TOKEN;

if (!token) {
  console.error('❌ ERRO: Token do MedBrave não encontrado em scripts/medevo_config.json');
  process.exit(1);
}

function parseCleanQuestion(raw) {
  // Extrai ano
  let year = raw.year ? parseInt(raw.year, 10) : null;
  if (!year && raw.sub_filter_ids) {
    for (const sf of raw.sub_filter_ids) {
      const m = sf.match(/Ano da Prova_(\d{4})/);
      if (m) { year = parseInt(m[1], 10); break; }
    }
  }
  if (!year && raw.tags) {
    for (const tag of raw.tags) {
      if (/^20\d{2}$/.test(tag)) { year = parseInt(tag, 10); break; }
    }
  }

  // Extrai instituição / universidade / banca
  let institution = null;
  if (raw.sub_filter_ids) {
    for (const sf of raw.sub_filter_ids) {
      if (sf.startsWith('Universidade_')) {
        const parts = sf.split('_');
        if (parts.length >= 3) {
          institution = parts.slice(2).join(' ');
        } else {
          institution = parts[1];
        }
        break;
      }
    }
  }
  if (!institution && raw.source) {
    institution = raw.source;
  }

  // Extrai UF
  let uf = null;
  if (raw.sub_filter_ids) {
    for (const sf of raw.sub_filter_ids) {
      const m = sf.match(/^Universidade_([A-Za-z]{2})(?:_|$)/);
      if (m) { uf = m[1].toUpperCase(); break; }
    }
  }
  if (!uf && raw.tags) {
    for (const tag of raw.tags) {
      if (/^[A-Z]{2}$/.test(tag) && tag !== 'R1' && tag !== 'R3') {
        uf = tag; break;
      }
    }
  }

  // Extrai Especialidade / Tema / Foco da hierarquia
  let specialty = null;
  let theme = null;
  let focus = null;
  if (raw.sub_filter_ids) {
    for (const sf of raw.sub_filter_ids) {
      if (!sf.startsWith('Universidade_') && !sf.startsWith('Ano da Prova') && sf.includes('_')) {
        const parts = sf.split('_');
        specialty = parts[0];
        if (parts.length > 1) theme = parts[1];
        if (parts.length > 2) focus = parts.slice(2).join(' ');
        break;
      }
    }
  }
  if (!specialty && raw.filter_ids) {
    const knownSpecs = ['ClinicaMedica', 'Cirurgia', 'Pediatria', 'Ginecologia', 'Obstetricia', 'MedicinaPreventiva'];
    specialty = raw.filter_ids.find(f => knownSpecs.includes(f)) || null;
  }

  // Alternativas limpas (apenas enunciado e opções, SEM explicações)
  let correctLetter = null;
  const cleanAlternatives = (raw.alternatives || []).map(a => {
    const letter = ORDER_TO_LETTER[a.order] || '';
    if (a.isCorrect) correctLetter = letter;
    return {
      id: a.id,
      order: a.order,
      letter,
      text: a.text,
      isCorrect: !!a.isCorrect
    };
  });

  return {
    id: raw.id,
    statement: raw.statement,
    title: raw.title || '',
    year,
    institution,
    banca: raw.source || null,
    source: raw.source || null,
    uf,
    specialty,
    theme,
    focus,
    difficulty: raw.difficulty || null,
    difficulty_level: raw.difficulty_level || null,
    is_annulled: !!raw.is_annulled,
    filter_ids: raw.filter_ids || [],
    sub_filter_ids: raw.sub_filter_ids || [],
    tags: raw.tags || [],
    correct_alternative_id: raw.correct_alternative_id || null,
    correct_letter: correctLetter,
    alternatives: cleanAlternatives
  };
}

async function fetchPage(page, attempt = 1) {
  const maxAttempts = 5;
  const url = `https://api.medbrave.com.br/api/questions?limit=100&page=${page}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'X-Client-Platform': 'web',
        'Content-Type': 'application/json'
      }
    });

    if (res.status === 429 || res.status === 503) {
      if (attempt <= maxAttempts) {
        const wait = 2500 * attempt;
        console.warn(`⏳ [Rate Limit HTTP ${res.status}] Aguardando ${wait / 1000}s na pág ${page}...`);
        await new Promise(r => setTimeout(r, wait));
        return fetchPage(page, attempt + 1);
      }
    }

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err.slice(0, 100)}`);
    }

    return await res.json();
  } catch (e) {
    if (attempt <= maxAttempts) {
      await new Promise(r => setTimeout(r, 1000 * attempt));
      return fetchPage(page, attempt + 1);
    }
    throw e;
  }
}

async function main() {
  console.log('========================================================================');
  console.log('🚀 EXTRAÇÃO MEDBRAVE: ENUNCIADOS + GABARITOS + METADADOS & FILTROS');
  console.log('   (Comentários omitidos conforme diretriz para máxima leveza)');
  console.log('========================================================================');
  console.log(`👤 Usuário: ${config.USER_NAME || config.USER_EMAIL || 'Autenticado'}`);

  console.log('\n📡 Conectando ao backend MedBrave...');
  const firstPage = await fetchPage(1);
  const totalQuestions = firstPage.total || 59877;
  const totalPages = Math.ceil(totalQuestions / 100);

  console.log(`📊 Acervo total MedBrave: ${totalQuestions.toLocaleString('pt-BR')} questões`);
  console.log(`📄 Total de páginas (100 por pág): ${totalPages} páginas`);

  // Carrega IDs já existentes se houver cache
  const existingMap = new Map();
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      if (Array.isArray(existing)) {
        existing.forEach(q => existingMap.set(q.id, q));
        console.log(`📦 Cache existente carregado: ${existingMap.size.toLocaleString('pt-BR')} questões.`);
      }
    } catch {}
  }

  // Prepara stream append em JSONL
  const jsonlStream = fs.createWriteStream(OUTPUT_JSONL, { flags: 'a', encoding: 'utf8' });

  let newlyAdded = 0;
  const startTime = Date.now();

  function processBatch(items) {
    for (const item of items) {
      if (!existingMap.has(item.id)) {
        const clean = parseCleanQuestion(item);
        existingMap.set(clean.id, clean);
        jsonlStream.write(JSON.stringify(clean) + '\n');
        newlyAdded++;
      }
    }
  }

  // Processa página 1
  processBatch(firstPage.items || []);

  console.log('\n⚡ Iniciando download de todas as 599 páginas com cadência segura (350ms)...');

  for (let p = 2; p <= totalPages; p++) {
    try {
      const data = await fetchPage(p);
      processBatch(data.items || []);

      if (p % 10 === 0 || p === totalPages) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = (newlyAdded / (Date.now() - startTime) * 1000).toFixed(1);
        const pct = ((p / totalPages) * 100).toFixed(1);
        const totalSaved = existingMap.size;
        console.log(`📊 [${pct}%] Pág ${p}/${totalPages} | Total Salvo: ${totalSaved.toLocaleString('pt-BR')} | Novos: ${newlyAdded} | Vel: ${rate} q/s | Tempo: ${elapsed}s`);
      }

      // Checkpoint JSON consolidado a cada 25 páginas (2.500 questões)
      if (p % 25 === 0 || p === totalPages) {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(Array.from(existingMap.values()), null, 2), 'utf8');
      }

      await new Promise(r => setTimeout(r, 350));
    } catch (err) {
      console.error(`❌ Erro na página ${p}:`, err.message);
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(Array.from(existingMap.values()), null, 2), 'utf8');
      break;
    }
  }

  jsonlStream.end();
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(Array.from(existingMap.values()), null, 2), 'utf8');

  console.log('\n========================================================================');
  console.log('🎉 EXTRAÇÃO COMPLETA FINALIZADA COM SUCESSO!');
  console.log(`📁 Arquivo consolidado: ${OUTPUT_FILE}`);
  console.log(`📁 Stream JSONL: ${OUTPUT_JSONL}`);
  console.log(`📊 Total final de questões com gabarito: ${existingMap.size.toLocaleString('pt-BR')}`);
  console.log('========================================================================\n');
}

main().catch(err => {
  console.error('\n❌ Erro crítico:', err.message);
  process.exit(1);
});
