import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

const CHECKPOINT_FILE = 'scripts/scan_supabase_checkpoint.json';
const OUTPUT_HITS_FILE = 'scripts/medevo_supabase_text_hits.json';
const OUTPUT_IMAGES_FILE = 'scripts/all_question_images.json';

const MEDEVO_REGEX = /med[-_ ]?evo/i;
const EVO_STANDALONE_REGEX = /\b(medevo|evo|app\.medevo|api\.medevo)\b/i;

async function run() {
  console.log('====================================================');
  console.log('🚀 INICIANDO VARREDURA COMPLETA SUPABASE (132k)');
  console.log('====================================================\n');

  let lastId = null;
  let totalScanned = 0;
  let hits = [];
  let imagesMap = new Map(); // url -> Array of { questionId, code, field }

  // Checkpoint restore
  if (fs.existsSync(CHECKPOINT_FILE)) {
    try {
      const cp = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
      lastId = cp.lastId;
      totalScanned = cp.totalScanned || 0;
      if (fs.existsSync(OUTPUT_HITS_FILE)) {
        hits = JSON.parse(fs.readFileSync(OUTPUT_HITS_FILE, 'utf8'));
      }
      if (fs.existsSync(OUTPUT_IMAGES_FILE)) {
        const rawImgs = JSON.parse(fs.readFileSync(OUTPUT_IMAGES_FILE, 'utf8'));
        rawImgs.forEach(item => imagesMap.set(item.url, item.references));
      }
      console.log(`Resumindo do checkpoint: último ID = ${lastId}, total já escaneado = ${totalScanned}, hits até agora = ${hits.length}`);
    } catch (e) {
      console.warn('Erro ao ler checkpoint, iniciando do zero.');
    }
  }

  const BATCH_SIZE = 1000;
  let batchNum = 0;
  const startTime = Date.now();

  while (true) {
    batchNum++;
    let query = supabase
      .from('questions')
      .select('id, code, banca, institution, year, statement, commentary, options, images')
      .order('id', { ascending: true })
      .limit(BATCH_SIZE);

    if (lastId) {
      query = query.gt('id', lastId);
    }

    let rows = null;
    let retries = 0;
    while (retries < 5) {
      try {
        const { data, error } = await query;
        if (error) throw error;
        rows = data;
        break;
      } catch (err) {
        retries++;
        console.warn(`[Batch ${batchNum}] Falha na requisição (tentativa ${retries}/5): ${err.message}. Aguardando 3s...`);
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    if (!rows || rows.length === 0) {
      console.log('Fim dos registros alcancado!');
      break;
    }

    for (const q of rows) {
      totalScanned++;
      const qHits = [];

      // 1. Text check: statement
      if (q.statement && MEDEVO_REGEX.test(q.statement)) {
        const match = q.statement.match(MEDEVO_REGEX);
        qHits.push({
          field: 'statement',
          match: match ? match[0] : 'medevo',
          snippet: extractSnippet(q.statement, MEDEVO_REGEX)
        });
      }

      // 2. Text check: commentary
      if (q.commentary && MEDEVO_REGEX.test(q.commentary)) {
        const match = q.commentary.match(MEDEVO_REGEX);
        qHits.push({
          field: 'commentary',
          match: match ? match[0] : 'medevo',
          snippet: extractSnippet(q.commentary, MEDEVO_REGEX)
        });
      }

      // 3. Text check: code, banca, institution
      for (const metaField of ['code', 'banca', 'institution']) {
        if (q[metaField] && MEDEVO_REGEX.test(q[metaField])) {
          qHits.push({
            field: metaField,
            match: q[metaField],
            snippet: q[metaField]
          });
        }
      }

      // 4. Text & Image check: options
      if (Array.isArray(q.options)) {
        q.options.forEach((opt, optIdx) => {
          const letter = opt.letter || String.fromCharCode(65 + optIdx);
          // Check option text
          if (opt.text && MEDEVO_REGEX.test(opt.text)) {
            qHits.push({
              field: `options[${letter}].text`,
              match: 'medevo',
              snippet: extractSnippet(opt.text, MEDEVO_REGEX)
            });
          }
          // Check option justification
          if (opt.justification && MEDEVO_REGEX.test(opt.justification)) {
            qHits.push({
              field: `options[${letter}].justification`,
              match: 'medevo',
              snippet: extractSnippet(opt.justification, MEDEVO_REGEX)
            });
          }
          // Collect images in option
          const optImgs = extractImageUrls(opt);
          optImgs.forEach(url => {
            addImageRef(imagesMap, url, {
              questionId: q.id,
              code: q.code,
              banca: q.banca,
              year: q.year,
              field: `options[${letter}]`
            });
          });
        });
      }

      // 5. Image check: images column
      if (q.images) {
        const stmtImgs = extractImageUrls(q.images);
        stmtImgs.forEach(url => {
          addImageRef(imagesMap, url, {
            questionId: q.id,
            code: q.code,
            banca: q.banca,
            year: q.year,
            field: 'statement.images'
          });
        });
      }

      if (qHits.length > 0) {
        hits.push({
          id: q.id,
          code: q.code,
          banca: q.banca,
          year: q.year,
          hits: qHits
        });
        console.log(`🚨 [HIT TEXTUAL] Questão ${q.code || q.id} (${q.banca} ${q.year}) - Campos: ${qHits.map(h => h.field).join(', ')}`);
      }
    }

    lastId = rows[rows.length - 1].id;

    if (batchNum % 5 === 0) {
      const elapsedSec = (Date.now() - startTime) / 1000;
      const rate = totalScanned / elapsedSec;
      console.log(`[Progresso] Escaneadas: ${totalScanned.toLocaleString()} | Hits textuais: ${hits.length} | Imagens únicas mapeadas: ${imagesMap.size} | Velocidade: ${rate.toFixed(0)} q/s`);

      // Save checkpoint
      fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({ lastId, totalScanned, timestamp: new Date().toISOString() }));
      fs.writeFileSync(OUTPUT_HITS_FILE, JSON.stringify(hits, null, 2));

      // Serialize imagesMap
      const serializedImgs = Array.from(imagesMap.entries()).map(([url, refs]) => ({ url, references: refs }));
      fs.writeFileSync(OUTPUT_IMAGES_FILE, JSON.stringify(serializedImgs, null, 2));
    }
  }

  // Final write
  fs.writeFileSync(OUTPUT_HITS_FILE, JSON.stringify(hits, null, 2));
  const finalImgs = Array.from(imagesMap.entries()).map(([url, refs]) => ({ url, references: refs }));
  fs.writeFileSync(OUTPUT_IMAGES_FILE, JSON.stringify(finalImgs, null, 2));
  if (fs.existsSync(CHECKPOINT_FILE)) fs.unlinkSync(CHECKPOINT_FILE);

  console.log('\n====================================================');
  console.log(`🏁 VARREDURA CONCLUÍDA!`);
  console.log(`Total de questões auditadas: ${totalScanned}`);
  console.log(`Total de questões com menção textual ao MedEvo: ${hits.length}`);
  console.log(`Total de imagens únicas catalogadas: ${finalImgs.length}`);
  console.log('====================================================');
}

function extractSnippet(text, regex) {
  if (typeof text !== 'string') return '';
  const idx = text.search(regex);
  if (idx === -1) return '';
  const start = Math.max(0, idx - 60);
  const end = Math.min(text.length, idx + 80);
  return (start > 0 ? '...' : '') + text.substring(start, end).replace(/\s+/g, ' ') + (end < text.length ? '...' : '');
}

function extractImageUrls(obj) {
  const urls = [];
  if (!obj) return urls;
  if (typeof obj === 'string') {
    if (obj.startsWith('http') || /\.(png|jpg|jpeg|webp|gif|svg)($|\?)/i.test(obj)) {
      urls.push(obj.trim());
    } else if (obj.startsWith('[') || obj.startsWith('{')) {
      try {
        const parsed = JSON.parse(obj);
        urls.push(...extractImageUrls(parsed));
      } catch (e) {}
    }
  } else if (Array.isArray(obj)) {
    obj.forEach(item => urls.push(...extractImageUrls(item)));
  } else if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'text' && typeof v === 'string' && (v.startsWith('http') || /\.(png|jpg|jpeg|webp|gif|svg)($|\?)/i.test(v))) {
        urls.push(v.trim());
      } else if (k === 'url' || k === 'src' || k === 'image' || k === 'imageUrl') {
        if (typeof v === 'string') urls.push(v.trim());
      }
    }
  }
  return urls;
}

function addImageRef(map, url, ref) {
  if (!url || typeof url !== 'string') return;
  const cleanUrl = url.trim();
  if (!cleanUrl) return;
  if (!map.has(cleanUrl)) {
    map.set(cleanUrl, []);
  }
  const list = map.get(cleanUrl);
  // deduplicate by questionId + field
  if (!list.some(r => r.questionId === ref.questionId && r.field === ref.field)) {
    list.push(ref);
  }
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
