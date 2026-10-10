import fs from 'fs';
import path from 'path';

const BASE_DIR = process.cwd();
const MANIFEST_PATH = path.join(BASE_DIR, 'data', 'medcurso_extracao_manifest.json');
const TARGET_DIR = path.join(BASE_DIR, 'data', 'knowledge', 'extracao_de_questoes');
const BUCKET_NAME = 'medical-knowledge';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

function toS3Key(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._\-\/]/g, '_')
    .replace(/_+/g, '_');
}

async function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ Manifesto não encontrado em data/medcurso_extracao_manifest.json');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  console.log('🔄 Sincronizando questões do MEDCURSO do Supabase Storage para o ambiente local...');
  console.log(`📦 Bucket: ${BUCKET_NAME} | Total Temas: ${manifest.totalFiles} | Total Questões: ${manifest.totalUniqueQuestions}`);

  let downloaded = 0;
  let alreadyPresent = 0;

  const tasks = [];
  for (const spec of manifest.specialties) {
    const specDir = path.join(TARGET_DIR, spec.specialty);
    if (!fs.existsSync(specDir)) fs.mkdirSync(specDir, { recursive: true });

    for (const file of spec.files) {
      const localFilePath = path.join(specDir, file.fileName);
      tasks.push({ spec: spec.specialty, file, localFilePath });
    }
  }

  const CONCURRENCY = 8;
  async function worker(task) {
    const { spec, file, localFilePath } = task;
    if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).size > 100) {
      alreadyPresent++;
      return;
    }

    const s3Path = `extracao_de_questoes/${toS3Key(spec)}/${toS3Key(file.fileName)}`;
    const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${s3Path}`;

    try {
      const res = await fetch(url, {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        }
      });

      if (res.ok) {
        const text = await res.text();
        fs.writeFileSync(localFilePath, text, 'utf8');
        downloaded++;
      } else {
        console.warn(`   ⚠️ Erro ao baixar ${file.fileName}: ${res.statusText}`);
      }
    } catch (err) {
      console.warn(`   ⚠️ Falha de rede para ${file.fileName}: ${err.message}`);
    }
  }

  async function pool() {
    const running = [];
    for (const t of tasks) {
      const p = worker(t).then(() => {
        running.splice(running.indexOf(p), 1);
      });
      running.push(p);
      if (running.length >= CONCURRENCY) {
        await Promise.race(running);
      }
    }
    await Promise.all(running);
  }

  await pool();

  console.log('\n===============================================================');
  console.log(`✅ Sincronização do MEDCURSO Concluída com Sucesso!`);
  console.log(`   • Já presentes localmente: ${alreadyPresent}`);
  console.log(`   • Baixados agora:          ${downloaded}`);
  console.log(`   • Local no disco:          data/knowledge/extracao_de_questoes/`);
  console.log('===============================================================\n');
}

main().catch(console.error);
