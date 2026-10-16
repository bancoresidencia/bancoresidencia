import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Configurações e caminhos
const CANDIDATE_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];
const CHROME_PATH = CANDIDATE_PATHS.find(p => fs.existsSync(p)) || 'chrome';
const PROFILE_DIR = path.join(process.cwd(), 'scripts', '.chrome_profile');

const rawArgs = process.argv.slice(2);
const shouldForceKill = rawArgs.some(a => a === '--kill' || a === '-k' || a === '--force' || a === '-f');
const targetUrl = rawArgs.find(a => !a.startsWith('-')) || 'https://drive.google.com/drive/u/3/folders/1ssJVFdvRGZN8g4l6NoMwHiKrQhhLpNse';

console.log('=====================================================');
console.log('🛡️  INICIALIZADOR BLINDADO DO CHROMIUM (ANTI-CRASH)  ');
console.log('=====================================================');

// 1. Limpeza forçada de processos e travas que causam crash ou travamento
function cleanupStaleLocksAndProcesses(force = false) {
  if (force || shouldForceKill) {
    console.log('⚡ Encerrando instâncias antigas/órfãs do Chromium...');
    try {
      execSync('taskkill /F /IM chrome.exe /T', { stdio: 'ignore' });
      // Pequena pausa para liberar descritores de arquivo no Windows
      const start = Date.now();
      while (Date.now() - start < 600) {}
    } catch {}
  }

  console.log('🧹 [1/3] Verificando e limpando travas do perfil...');
  
  if (fs.existsSync(PROFILE_DIR)) {
    const lockFiles = ['lockfile', 'SingletonLock', 'SingletonCookie', 'SingletonSocket'];
    for (const lf of lockFiles) {
      const fullPath = path.join(PROFILE_DIR, lf);
      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`   ✓ Arquivo de trava removido: ${lf}`);
        }
      } catch (err) {
        if (err.code === 'EBUSY') {
          console.log(`   ℹ️ O perfil já está em uso por uma instância ativa.`);
        } else {
          console.warn(`   ⚠️ Aviso ao remover ${lf}:`, err.message);
        }
      }
    }
  } else {
    fs.mkdirSync(PROFILE_DIR, { recursive: true });
  }
}

// 2. Flags anti-crash e bypass completo para Windows
const ANTI_CRASH_FLAGS = [
  `--user-data-dir=${PROFILE_DIR}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--start-maximized',
  '--disable-blink-features=AutomationControlled',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu-process-crash-limit',
  '--disable-features=IsolateOrigins,site-per-process,AudioServiceOutOfProcess',
  '--disable-crash-reporter',
  '--disable-breakpad',
  '--ignore-certificate-errors',
  '--allow-running-insecure-content'
];

function launchChromium(url, fallbackGpu = false) {
  const flags = [...ANTI_CRASH_FLAGS];
  if (fallbackGpu) {
    flags.push('--disable-gpu');
    flags.push('--use-gl=swiftshader');
    console.log('🔄 Tentando com modo de renderização por software (--disable-gpu)...');
  }
  flags.push(url);

  console.log(`🚀 [2/3] Disparando Chromium GUI...`);
  console.log(`   URL: ${url}`);
  console.log(`   Perfil: ${PROFILE_DIR}`);

  const child = spawn(CHROME_PATH, flags, {
    detached: true,
    stdio: 'ignore'
  });

  child.unref();

  console.log(`✅ [3/3] Chromium aberto com sucesso no Windows!`);
  console.log(`   PID: ${child.pid}`);
  console.log('=====================================================');
}

try {
  cleanupStaleLocksAndProcesses(false);
  launchChromium(targetUrl);
} catch (error) {
  console.error('❌ Falha na primeira tentativa:', error.message);
  console.log('🔄 Executando recuperação automática (limpeza forçada e retry)...');
  try {
    cleanupStaleLocksAndProcesses(true);
    launchChromium(targetUrl, true);
  } catch (fatal) {
    console.error('❌ Erro fatal ao iniciar Chromium:', fatal.message);
    process.exit(1);
  }
}
