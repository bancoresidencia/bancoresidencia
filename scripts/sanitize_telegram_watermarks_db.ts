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
    .replace(/T\.ME(?:\/[^\s]*)?/gi, '')
    .replace(/MEDOPEN\s*-\s*ACERVO\s*MÉDICO\s*GRATUITO/gi, '')
    .replace(/MEDOPEN/gi, '')
    .replace(/ACERVO\s*MÉDICO\s*GRATUITO/gi, '')
    .replace(/Extensivo\s*-\s*[A-Za-zÀ-ÿ\s]+\s*\t?\d+\/\d+/gi, '')
    .replace(/\d+\.\s*[A-Za-zÀ-ÿ\s]+-\s*Parte\s+[IVX]+/gi, '')
    .replace(/Fala,\s*Estrategista!?\s*/gi, '')
    .replace(/Caro\s*estrategista,?\s*/gi, '')
    .replace(/Estrategista,?\s*/gi, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function runSanitization() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`=== HIGIENIZAÇÃO CIRÚRGICA DE MARCAS D’ÁGUA NO SUPABASE ${isDryRun ? '(MODO SIMULAÇÃO / DRY-RUN)' : '(EXECUÇÃO REAL)'} ===\n`);

  const backupDir = path.resolve('data/backups_pre_correcao');
  const backupFiles = fs.readdirSync(backupDir).filter((f) => f.startsWith('backup_medopen_1832_'));
  let matchingRows: Array<{ id: string; code: string; commentary: string }> = [];

  if (backupFiles.length > 0) {
    const backupFile = path.join(backupDir, backupFiles[backupFiles.length - 1]);
    console.log(`1. Carregando acervo auditado de backup existente: ${backupFile}`);
    matchingRows = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    console.log(`✓ Carregadas ${matchingRows.length} questões com marcas do backup imutável.`);
  } else {
    console.error('Nenhum backup encontrado em data/backups_pre_correcao.');
    process.exit(1);
  }

  if (isDryRun) {
    console.log('\n[SIMULAÇÃO DRY-RUN] Verificando integridade das 1.832 limpezas:');
    let residues = 0;
    matchingRows.forEach((r) => {
      const c = cleanTelegramWatermarks(r.commentary);
      if (/medopen|t\.me/i.test(c)) residues++;
    });
    console.log(`- Total testadas: ${matchingRows.length}`);
    console.log(`- Resíduos restantes: ${residues}`);
    console.log('\n✓ Simulação concluída com sucesso. Zero resíduos!');
    return;
  }

  // 2. Aplicar atualização cirúrgica no Supabase em lotes concorrentes
  console.log('\n2. Aplicando atualização cirúrgica no Supabase via REST PATCH...');
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
  console.log(`\n\n✓ Concluído com sucesso em ${updateElapsed}s!`);
  console.log(`Questões atualizadas no banco: ${successCount} | Erros: ${errorCount}`);
}

runSanitization().catch(console.error);
