import fs from 'node:fs';
import path from 'node:path';

// 1. Carregar variáveis de ambiente locais (.env.local)
const envPath = path.resolve('.env.local');
if (!fs.existsSync(envPath)) {
  console.error('Arquivo .env.local não encontrado.');
  process.exit(1);
}

const env = Object.fromEntries(
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Chaves do Supabase não configuradas.');
  process.exit(1);
}

// Função cirúrgica de limpeza de marcas de Telegram e cabeçalhos de apostila
function cleanTelegramWatermarks(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw
    .replace(/T\.ME\/[A-Za-z0-9_\/]+/gi, '')
    .replace(/MEDOPEN\s*-\s*ACERVO\s*MÉDICO\s*GRATUITO/gi, '')
    .replace(/MEDOPEN/gi, '')
    .replace(/ACERVO\s*MÉDICO\s*GRATUITO/gi, '')
    .replace(/Extensivo\s*-\s*[A-Za-zÀ-ÿ\s]+\s*\t?\d+\/\d+/gi, '')
    .replace(/\d+\.\s*[A-Za-zÀ-ÿ\s]+-\s*Parte\s+[IVX]+/gi, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function hasWatermark(commentary: string | null | undefined): boolean {
  if (!commentary) return false;
  return /medopen|t\.me\/|extensivo\s*-\s*[a-zà-ÿ\s]+\s*\t?\d+\/\d+/i.test(commentary);
}

async function runSanitization() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`=== HIGIENIZAÇÃO CIRÚRGICA DE MARCAS D’ÁGUA NO SUPABASE ${isDryRun ? '(MODO SIMULAÇÃO / DRY-RUN)' : ''} ===\n`);

  const backupDir = path.resolve('data/backups_pre_correcao');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log('1. Varrendo banco via Keyset Pagination B-Tree Indexada (order=id.asc&id=gt.lastId)...');

  let lastId: string | null = null;
  const limit = 1000;
  let totalScanned = 0;
  const matchingRows: Array<{ id: string; code: string; commentary: string }> = [];

  const startTime = Date.now();

  while (true) {
    let url = `${SUPABASE_URL}/rest/v1/questions?select=id,code,commentary&commentary=not.is.null&order=id.asc&limit=${limit}`;
    if (lastId) {
      url += `&id=gt.${lastId}`;
    }

    const res = await fetch(url, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`
      }
    });

    if (!res.ok) {
      console.error(`Erro HTTP ${res.status}: ${await res.text()}`);
      break;
    }

    const rows: Array<{ id: string; code: string; commentary: string }> = await res.json();
    if (!rows || rows.length === 0) {
      break;
    }

    totalScanned += rows.length;
    for (const r of rows) {
      if (hasWatermark(r.commentary)) {
        matchingRows.push(r);
      }
    }

    lastId = rows[rows.length - 1].id;
    process.stdout.write(`\rVarredas: ${totalScanned.toLocaleString('pt-BR')} | Encontradas com marca: ${matchingRows.length}`);

    if (rows.length < limit) {
      break;
    }
  }

  const scanElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n✓ Varredura concluída em ${scanElapsed}s!`);
  console.log(`Total de questões escaneadas: ${totalScanned.toLocaleString('pt-BR')}`);
  console.log(`Total de questões com marcas detectadas: ${matchingRows.length}`);

  if (matchingRows.length === 0) {
    console.log('Nenhuma questão precisa de atualização no banco.');
    return;
  }

  // 2. Salvar backup seguro
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `backup_medopen_${matchingRows.length}_${timestamp}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(matchingRows, null, 2), 'utf8');
  console.log(`✓ Backup pré-correção salvo em: ${backupFile}`);

  if (isDryRun) {
    console.log('\n[SIMULAÇÃO DRY-RUN] Amostras de Antes/Depois:');
    matchingRows.slice(0, 3).forEach((r, idx) => {
      console.log(`\n--- EXEMPLO ${idx + 1} (${r.code}) ---`);
      console.log('ANTES:', JSON.stringify(r.commentary.slice(0, 140)));
      console.log('DEPOIS:', JSON.stringify(cleanTelegramWatermarks(r.commentary).slice(0, 140)));
    });
    console.log('\n✓ Dry-run concluído. Nenhuma linha foi alterada no banco de dados.');
    return;
  }

  // 3. Atualizar no Supabase em lotes concorrentes controlados
  console.log('\n2. Aplicando atualização cirúrgica no Supabase...');
  const updateStartTime = Date.now();
  const batchSize = 25;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < matchingRows.length; i += batchSize) {
    const batch = matchingRows.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (row) => {
        const cleaned = cleanTelegramWatermarks(row.commentary);
        if (cleaned.length < 10 && row.commentary.length > 50) {
          console.warn(`[AVISO] Questão ${row.code} resultou em texto curto. Pulando para segurança.`);
          errorCount++;
          return;
        }

        try {
          const patchUrl = `${SUPABASE_URL}/rest/v1/questions?id=eq.${row.id}`;
          const patchRes = await fetch(patchUrl, {
            method: 'PATCH',
            headers: {
              apikey: SERVICE_KEY,
              Authorization: `Bearer ${SERVICE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal'
            },
            body: JSON.stringify({ commentary: cleaned })
          });

          if (!patchRes.ok) {
            console.error(`Erro ao atualizar ${row.code}: HTTP ${patchRes.status}`);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err: any) {
          console.error(`Erro na requisição ${row.code}:`, err.message);
          errorCount++;
        }
      })
    );

    const progress = Math.min(i + batchSize, matchingRows.length);
    const pct = ((progress / matchingRows.length) * 100).toFixed(1);
    process.stdout.write(`\rProgresso de atualização: ${progress}/${matchingRows.length} (${pct}%)`);
  }

  const updateElapsed = ((Date.now() - updateStartTime) / 1000).toFixed(1);
  console.log(`\n\n✓ Concluído em ${updateElapsed}s!`);
  console.log(`Questões atualizadas no banco: ${successCount} | Erros: ${errorCount}`);
}

runSanitization().catch(console.error);
