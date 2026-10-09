import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Users\\cnath\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe';
const profileDir = path.join(process.cwd(), 'scripts', '.chrome_profile');
const url = 'https://drive.google.com/drive/u/1/folders/1_cgWHry1w_sJjQhrqIvW5ry0n7kv-slx';

if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}

console.log('Iniciando Chromium diretamente no Windows Desktop...');
const child = spawn(
  chromePath,
  [
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--start-maximized',
    url
  ],
  {
    detached: true,
    stdio: 'ignore'
  }
);

child.unref();
console.log('✅ Processo do Chromium disparado com sucesso! PID:', child.pid);
