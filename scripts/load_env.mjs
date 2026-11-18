import fs from 'fs';

/**
 * Loads `.env.local` (if present) merged with `process.env` for local scripts.
 */
export function loadLocalEnv() {
  const env = { ...process.env };
  if (fs.existsSync('.env.local')) {
    fs.readFileSync('.env.local', 'utf8').split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) return;
      const k = trimmed.slice(0, eqIdx).trim();
      const v = trimmed.slice(eqIdx + 1).trim();
      if (k && v) env[k] = v;
    });
  }
  return env;
}

/**
 * Resolves the first available key from `candidates` (CLI `--key=` takes priority).
 */
export function resolveGeminiKey(env, candidates = ['GEMINI_API_KEY', 'GEMINI_API_KEY_1']) {
  const argKey = process.argv.find((a) => a.startsWith('--key='));
  if (argKey) {
    const val = argKey.slice('--key='.length).trim();
    if (val) return val;
  }
  for (const name of candidates) {
    if (env[name]) return env[name];
  }
  return '';
}
