import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const env = {};
  if (fs.existsSync('.env.local')) {
    const lines = fs.readFileSync('.env.local', 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim().replace(/^['\"]|['\"]$/g, '');
        env[key] = val;
      }
    }
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes em .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

const LOCAL_DIR = path.resolve('public/images/institutions');
const BUCKET_NAME = 'questoes';
const REMOTE_PREFIX = 'institutions';

async function withRetry(fn, retries = 3, delayMs = 1500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fn();
      if (res && res.error) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, delayMs * attempt));
          continue;
        }
      }
      return res;
    } catch (err) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, delayMs * attempt));
        continue;
      }
      throw err;
    }
  }
}

async function run() {
  console.log('====================================================');
  console.log('   UPLOAD DOS 124 LOGOS LOCAIS PARA O SUPABASE');
  console.log('====================================================');

  if (!fs.existsSync(LOCAL_DIR)) {
    console.error(`❌ Diretório local ${LOCAL_DIR} não encontrado.`);
    process.exit(1);
  }

  const files = fs.readdirSync(LOCAL_DIR).filter(f => f.endsWith('.webp'));
  console.log(`📁 Total de arquivos locais encontrados: ${files.length}`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const localPath = path.join(LOCAL_DIR, file);
    const remotePath = `${REMOTE_PREFIX}/${file}`;
    const fileBuffer = fs.readFileSync(localPath);

    try {
      const uploadRes = await withRetry(async () => {
        return await supabase.storage
          .from(BUCKET_NAME)
          .upload(remotePath, fileBuffer, {
            contentType: 'image/webp',
            upsert: true
          });
      });

      if (uploadRes.error) {
        throw new Error(uploadRes.error.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(remotePath);

      successCount++;
      console.log(`[${i + 1}/${files.length}] ✅ Upload OK: ${remotePath} (${(fileBuffer.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      failCount++;
      console.error(`[${i + 1}/${files.length}] ❌ Falha em ${file}: ${err.message}`);
    }
  }

  console.log('\n====================================================');
  console.log('   RESUMO DO UPLOAD PARA O SUPABASE');
  console.log(`   Sucessos: ${successCount} / ${files.length}`);
  console.log(`   Falhas: ${failCount}`);
  console.log('====================================================\n');
}

run().catch(console.error);
