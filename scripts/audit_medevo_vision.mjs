import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// 1. Carregar variáveis de ambiente (.env.local)
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

// 2. Extrair chaves do pool
const API_KEYS = Object.keys(env)
  .filter(k => k.startsWith('GEMINI_API_KEY'))
  .map(k => env[k])
  .filter((k, idx, self) => k && k.length > 10 && self.indexOf(k) === idx);

if (API_KEYS.length === 0) {
  console.error('❌ Nenhuma GEMINI_API_KEY válida encontrada em .env.local');
  process.exit(1);
}

console.log(`🔑 Pool de API Keys carregado: ${API_KEYS.length} chaves disponíveis.`);

// Modelos suportados com fallback
const MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest'
];

let keyIndex = 0;
function getNextKey() {
  const k = API_KEYS[keyIndex % API_KEYS.length];
  keyIndex++;
  return k;
}

// 3. Carregar e otimizar imagens de referência
const REF_ICON_PATH = 'scripts/assets/medevo_icon_ref.png';
const REF_FULL_PATH = 'scripts/assets/medevo_logo_full_ref.png';

if (!fs.existsSync(REF_ICON_PATH) || !fs.existsSync(REF_FULL_PATH)) {
  console.error('❌ Arquivos de referência do logo MedEvo não encontrados em scripts/assets/');
  process.exit(1);
}

console.log('🖼️ Preparando referências visuais do MedEvo...');
const refIconBuffer = await sharp(REF_ICON_PATH)
  .resize(300, 300, { fit: 'inside' })
  .png()
  .toBuffer();
const refIconBase64 = refIconBuffer.toString('base64');

const refFullBuffer = await sharp(REF_FULL_PATH)
  .resize(300, 300, { fit: 'inside' })
  .png()
  .toBuffer();
const refFullBase64 = refFullBuffer.toString('base64');

// 4. Argumentos CLI
const args = process.argv.slice(2);
const targetArg = args.find(a => a.startsWith('--target='))?.split('=')[1] || 'medevo';
const limitArg = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '0', 10);
const concurrencyArg = parseInt(args.find(a => a.startsWith('--concurrency='))?.split('=')[1] || '2', 10);
const delayArg = parseInt(args.find(a => a.startsWith('--delay='))?.split('=')[1] || '2500', 10);

// 5. Carregar lista de imagens
const ALL_IMAGES_PATH = 'scripts/all_question_images.json';
if (!fs.existsSync(ALL_IMAGES_PATH)) {
  console.error(`❌ Arquivo ${ALL_IMAGES_PATH} não encontrado.`);
  process.exit(1);
}

const allQuestionImages = JSON.parse(fs.readFileSync(ALL_IMAGES_PATH, 'utf8'));

let targetImages = [];
if (targetArg === 'medevo') {
  targetImages = allQuestionImages.filter(img => img.url.toLowerCase().includes('medevo'));
  console.log(`🎯 Modo: ALVO MEDEVO URLs (${targetImages.length} imagens prioritárias)`);
} else {
  targetImages = allQuestionImages;
  console.log(`🎯 Modo: TODAS AS IMAGENS DA PLATAFORMA (${targetImages.length} imagens no total)`);
}

if (limitArg > 0) {
  targetImages = targetImages.slice(0, limitArg);
  console.log(`⚠️ Limitado a ${limitArg} imagens.`);
}

// 6. Checkpoint e persistência
const RESULTS_FILE = 'scripts/medevo_vision_audit_results.json';
let auditStore = {
  startedAt: new Date().toISOString(),
  lastUpdatedAt: new Date().toISOString(),
  targetMode: targetArg,
  summary: {
    totalAudited: 0,
    detectedWithLogo: 0,
    clean: 0,
    errors: 0,
    byType: {
      marca_dagua_sutil: 0,
      total: 0,
      parcial_cortado: 0,
      apenas_icone: 0,
      apenas_texto: 0
    }
  },
  results: {}
};

if (fs.existsSync(RESULTS_FILE)) {
  try {
    const existing = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
    auditStore = {
      ...existing,
      results: existing.results || {}
    };
    console.log(`🔄 Checkpoint carregado: ${Object.keys(auditStore.results).length} imagens já auditadas.`);
  } catch (e) {
    console.warn('⚠️ Erro ao ler checkpoint anterior, iniciando nova contagem.');
  }
}

function saveCheckpoint() {
  auditStore.lastUpdatedAt = new Date().toISOString();
  
  // Recalcular sumário
  let detected = 0;
  let clean = 0;
  let errors = 0;
  const byType = {
    marca_dagua_sutil: 0,
    total: 0,
    parcial_cortado: 0,
    apenas_icone: 0,
    apenas_texto: 0
  };

  Object.values(auditStore.results).forEach(r => {
    if (r.error) {
      errors++;
    } else if (r.has_medevo) {
      detected++;
      const t = r.presence_type;
      if (byType[t] !== undefined) byType[t]++;
      else byType[t] = 1;
    } else {
      clean++;
    }
  });

  auditStore.summary = {
    totalAudited: Object.keys(auditStore.results).length,
    detectedWithLogo: detected,
    clean,
    errors,
    byType
  };

  fs.writeFileSync(RESULTS_FILE, JSON.stringify(auditStore, null, 2));
}

// 7. Função de análise via Gemini Vision
const PROMPT = `Você é um perito auditor em marcas e identificadores visuais em questões de medicina.
Temos 2 imagens de referência do logotipo "MedEvo":
- Referência 1: Mascote/ícone de cérebro azul sorridente com uma cruz médica laranja no topo direito.
- Referência 2: Logo institucional com o cérebro azul + cruz laranja e o texto escrito "MedEvo".

Inspecione a IMAGEM MÉDICA ALVO (a 3ª imagem enviada).
Procure atentamente por:
1. O mascote/ícone (mesmo que recortado parcialmente, em um canto, invertido, transparente ou cortado).
2. O nome/texto "MedEvo" ou variações ("Med", "Evo").
3. Marca d'água oculta ou semitransparente em fundo preto/cinza de radiografias, tomografias ou ilustrações.
4. Logotipo em cabeçalho, rodapé ou cantos da imagem.

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "has_medevo": boolean,
  "confidence": number,
  "presence_type": "nenhum" | "total" | "parcial_cortado" | "marca_dagua_sutil" | "apenas_texto" | "apenas_icone",
  "location": "nenhum" | "canto_superior_esquerdo" | "canto_superior_direito" | "canto_inferior_esquerdo" | "canto_inferior_direito" | "centro" | "outro",
  "details": "descrição concisa"
}`;

async function analyzeTargetImage(imageUrl) {
  // Download da imagem alvo
  const res = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ao baixar imagem`);
  }
  const rawBuf = Buffer.from(await res.arrayBuffer());
  if (rawBuf.length === 0) {
    throw new Error('Buffer vazio recebido');
  }

  // Redimensionar para max 1024px para economizar banda e tempo
  const targetBuffer = await sharp(rawBuf)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .png()
    .toBuffer();
  const targetBase64 = targetBuffer.toString('base64');

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: PROMPT },
          { inlineData: { mimeType: 'image/png', data: refIconBase64 } },
          { inlineData: { mimeType: 'image/png', data: refFullBase64 } },
          { inlineData: { mimeType: 'image/png', data: targetBase64 } }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1
    }
  };

  let lastError = null;

  // Tentativa rotativa de chave e modelo com backoff exponencial
  const MAX_ATTEMPTS = 12;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const key = getNextKey();
    const model = MODELS[attempt % MODELS.length];

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const apiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(45000)
      });

      if (!apiRes.ok) {
        const errText = await apiRes.text();
        if (apiRes.status === 429 || apiRes.status === 503) {
          const waitSec = Math.min(25, 4 + attempt * 3);
          console.log(`      ⏳ Rate limit (HTTP ${apiRes.status}) na chave. Aguardando ${waitSec}s antes de tentar próxima chave/modelo...`);
          await new Promise(r => setTimeout(r, waitSec * 1000));
          continue;
        }
        throw new Error(`API Gemini erro ${apiRes.status}: ${errText.slice(0, 100)}`);
      }

      const json = await apiRes.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Resposta vazia da IA');
      }

      const parsed = JSON.parse(rawText);
      return {
        has_medevo: !!parsed.has_medevo,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : (parsed.has_medevo ? 0.9 : 0),
        presence_type: parsed.presence_type || 'nenhum',
        location: parsed.location || 'nenhum',
        details: parsed.details || ''
      };
    } catch (err) {
      lastError = err;
      if (err.name === 'AbortError' || err.name === 'TimeoutError') {
        console.log(`      ⚠️ Timeout/Abort na requisição (${model}). Tentando próxima chave...`);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
    }
  }

  throw lastError || new Error('Falha após múltiplas tentativas com o pool');
}

// 8. Fila de execução concorrente
async function main() {
  console.log('\n====================================================');
  console.log('🚀 INICIANDO AUDITORIA GEMINI VISION - LOGO MEDEVO');
  console.log('====================================================');
  console.log(`Itens totais a processar nesta execução: ${targetImages.length}`);
  console.log(`Concorrência: ${concurrencyArg} | Delay entre chamadas: ${delayArg}ms\n`);

  // Filtrar o que já foi auditado
  const pending = targetImages.filter(item => !auditStore.results[item.url]);
  console.log(`Itens restantes a auditar: ${pending.length} (já auditados: ${targetImages.length - pending.length})\n`);

  if (pending.length === 0) {
    console.log('✅ Todas as imagens deste alvo já foram auditadas anteriormente!');
    saveCheckpoint();
    printFinalSummary();
    return;
  }

  let processedCount = 0;
  let activeIndex = 0;

  async function worker(workerId) {
    while (activeIndex < pending.length) {
      const currentIdx = activeIndex++;
      const item = pending[currentIdx];
      const url = item.url;
      const refCount = item.references?.length || 0;
      const firstRef = item.references?.[0] || {};
      const label = `[${currentIdx + 1}/${pending.length}] [W${workerId}] Q: ${firstRef.code || firstRef.questionId || 'N/A'}`;

      try {
        console.log(`${label} -> Auditando: ${url.slice(0, 70)}...`);
        const result = await analyzeTargetImage(url);

        auditStore.results[url] = {
          url,
          references: item.references,
          ...result,
          auditedAt: new Date().toISOString()
        };

        if (result.has_medevo) {
          console.log(`\n🚨🚨 [HIT CONFIRMADO] ${label}`);
          console.log(`   Tipo: ${result.presence_type} | Confiança: ${(result.confidence * 100).toFixed(0)}% | Local: ${result.location}`);
          console.log(`   Detalhes: ${result.details}`);
          console.log(`   URL: ${url}\n`);
        } else {
          console.log(`   ✅ Limpa (${result.details.slice(0, 60)}...)`);
        }
      } catch (err) {
        console.warn(`   ❌ Erro em ${label}: ${err.message}`);
        // Se for erro permanente de download da imagem (ex: 404), salva erro. Se for rate limit/pool, NÃO salva para re-tentar depois.
        if (err.message && err.message.includes('HTTP 404')) {
          auditStore.results[url] = {
            url,
            references: item.references,
            error: err.message,
            auditedAt: new Date().toISOString()
          };
        }
      }

      processedCount++;
      if (processedCount % 5 === 0) {
        saveCheckpoint();
      }

      await new Promise(r => setTimeout(r, delayArg));
    }
  }

  // Lança workers concorrentes
  const workers = Array.from({ length: concurrencyArg }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  saveCheckpoint();
  printFinalSummary();
}

function syncManifest() {
  const MANIFEST_PATH = 'src/data/medevoAuditManifest.json';
  if (!fs.existsSync(MANIFEST_PATH)) return;
  try {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    const urlToVision = new Map();
    Object.values(auditStore.results || {}).forEach(r => {
      if (r.url) urlToVision.set(r.url, r);
    });

    let totalVisionHitsInManifest = 0;
    manifest.questions = manifest.questions.map(q => {
      let hasVisionHit = false;
      const visionDetails = [];

      (q.images || []).forEach(img => {
        const vr = urlToVision.get(img.url);
        if (vr) {
          img.visionAudit = {
            audited: true,
            has_medevo: vr.has_medevo,
            confidence: vr.confidence,
            presence_type: vr.presence_type,
            location: vr.location,
            details: vr.details
          };
          if (vr.has_medevo) {
            hasVisionHit = true;
            visionDetails.push({
              url: img.url,
              presence_type: vr.presence_type,
              location: vr.location,
              confidence: vr.confidence,
              details: vr.details
            });
          }
        }
      });

      if (hasVisionHit) {
        q.hasVisionHit = true;
        q.visionHits = visionDetails;
        totalVisionHitsInManifest++;
      } else if (q.hasVisionHit === undefined) {
        q.hasVisionHit = false;
      }
      return q;
    });

    manifest.summary.visionAuditedCount = auditStore.summary.totalAudited;
    manifest.summary.visionHitsCount = totalVisionHitsInManifest;
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log(`🔄 Manifesto atualizado automaticamente (${totalVisionHitsInManifest} questões com Vision Hit)`);
  } catch (err) {
    console.warn('Aviso: falha ao sincronizar manifesto:', err.message);
  }
}

function printFinalSummary() {
  console.log('\n====================================================');
  console.log('📊 RELATÓRIO CONSOLIDADO DA AUDITORIA GEMINI VISION');
  console.log('====================================================');
  console.log(`Total de imagens auditadas: ${auditStore.summary.totalAudited}`);
  console.log(`🚨 Imagens com MedEvo detectado: ${auditStore.summary.detectedWithLogo}`);
  console.log(`✅ Imagens limpas: ${auditStore.summary.clean}`);
  console.log(`⚠️ Falhas de download/timeout: ${auditStore.summary.errors}`);
  console.log('\nDistribuição por tipo de presença:');
  console.log(JSON.stringify(auditStore.summary.byType, null, 2));
  console.log(`\nArquivo de resultados salvo em: ${RESULTS_FILE}`);
  syncManifest();
}

main().catch(err => {
  console.error('Erro fatal:', err);
  saveCheckpoint();
});

