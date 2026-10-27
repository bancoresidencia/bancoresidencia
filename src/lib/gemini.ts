/**
 * Utilitário centralizado e resiliente para chamadas à Google Gemini API
 * Suporta pool completo de chaves (incluindo as 8 chaves configuradas),
 * rotação inteligente, fallback automático entre chaves ao atingir quota (429/403)
 * e priorização de modelos com alta disponibilidade.
 */

export function getAllGeminiKeys(): string[] {
  const keys: string[] = [];

  const addKey = (val?: string) => {
    if (!val) return;
    const trimmed = val.trim().replace(/["']/g, '');
    if (trimmed.length > 10 && !keys.includes(trimmed)) {
      keys.push(trimmed);
    }
  };

  // 1. Chave raiz e variações padrão
  addKey(process.env.GEMINI_API_KEY);
  addKey(process.env.GOOGLE_API_KEY);

  // 2. Chave composta por delimitador (vírgula, ponto-e-vírgula ou quebra de linha)
  if (process.env.GEMINI_API_KEYS) {
    process.env.GEMINI_API_KEYS.split(/[,;\n\r]+/).forEach((k) => addKey(k));
  }

  // 3. Chaves numeradas de 1 a 20 (cobrindo as 8 chaves do pool e expansões)
  for (let i = 1; i <= 20; i++) {
    addKey(process.env[`GEMINI_API_KEY_${i}`]);
    addKey(process.env[`GEMINI_KEY_${i}`]);
    addKey(process.env[`GEMINI_API_KEY_${String(i).padStart(2, '0')}`]);
  }

  // 4. Varredura dinâmica de qualquer chave iniciada por GEMINI no process.env
  if (typeof process !== 'undefined' && process.env) {
    Object.keys(process.env).forEach((keyName) => {
      if (/^(GEMINI|GOOGLE).*KEY/i.test(keyName)) {
        const val = process.env[keyName];
        if (val && val.includes(',')) {
          val.split(',').forEach((k) => addKey(k));
        } else {
          addKey(val);
        }
      }
    });
  }

  return Array.from(new Set(keys));
}

export function getAvailableGeminiKey(): string | null {
  const keys = getAllGeminiKeys();
  if (keys.length > 0) {
    const randomIdx = Math.floor(Math.random() * keys.length);
    return keys[randomIdx];
  }
  return null;
}

// Ordem estrita de modelos testados e ativos na API do Google
export const CANDIDATE_GEMINI_MODELS = [
  'gemini-3-flash-preview', // Ativo, ultra-rápido e estável (HTTP 200)
  'gemini-3.5-flash',       // Padrão ouro flash
  'gemini-flash-latest',    // Fallback dinâmico
  'gemini-3.8-flash'        // Fallback de alta capacidade
];

interface CallGeminiOptions {
  temperature?: number;
  responseMimeType?: 'application/json' | 'text/plain';
}

/**
 * Parser resiliente para extração de JSON gerado por IA,
 * removendo cercas markdown (```json ... ```) e caracteres excedentes.
 */
export function parseCleanJson<T = Record<string, unknown>>(raw: string): T {
  let cleaned = (raw || '').trim();

  // Remove blocos de código markdown
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  // 1. Tentativa direta de parse
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // 2. Extração isolada do primeiro objeto JSON válido { ... }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleaned.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate) as T;
      } catch {
        // 3. Sanitização de quebras de linha em strings ou escapes
        const sanitized = candidate
          .replace(/[\u0000-\u001F]+/g, ' ')
          .replace(/\\'/g, "'");
        return JSON.parse(sanitized) as T;
      }
    }
    throw new Error('Falha ao processar estrutura JSON retornada pela IA.');
  }
}

/**
 * Executa chamada à API Gemini com rotação de chaves e fallback entre modelos.
 * Se uma chave retornar 429 (Quota Exceeded) ou 403 (Proibido/Expirado),
 * alterna imediatamente para a próxima chave válida no pool.
 */
export async function callGeminiAi(prompt: string, options: CallGeminiOptions = {}): Promise<string> {
  const allKeys = getAllGeminiKeys();
  if (allKeys.length === 0) {
    throw new Error('Nenhuma chave de API Gemini (GEMINI_API_KEY) configurada no ambiente.');
  }

  const { temperature = 0.2, responseMimeType = 'application/json' } = options;

  let lastError: Error | null = null;

  // Embaralha levemente o pool para distribuir requisições, preservando todas para fallback
  const keysToTry = [...allKeys].sort(() => Math.random() - 0.5);

  for (let keyIdx = 0; keyIdx < keysToTry.length; keyIdx++) {
    const geminiKey = keysToTry[keyIdx];

    for (const model of CANDIDATE_GEMINI_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType,
              temperature
            }
          })
        });

        if (res.ok) {
          const json = await res.json();
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && typeof text === 'string') {
            return text.trim();
          }
        } else {
          const errText = await res.text();
          console.warn(
            `[Gemini API] Falha no modelo ${model} com chave [${keyIdx + 1}/${keysToTry.length}] (HTTP ${res.status}):`,
            errText.slice(0, 160)
          );

          // Se for 429 (quota excedida) ou 403 (não autorizada), pula imediatamente para a PRÓXIMA chave!
          if (res.status === 429 || res.status === 403) {
            lastError = new Error(`Quota ou permissão Gemini excedida na chave ${keyIdx + 1}: ${errText.slice(0, 100)}`);
            break; // Sai do loop de modelos desta chave e tenta a próxima chave do pool
          }
        }
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        lastError = error;
        console.warn(`[Gemini API] Erro de rede no modelo ${model}:`, error.message);
      }
    }
  }

  throw lastError || new Error('Não foi possível obter resposta de nenhum dos modelos Gemini disponíveis.');
}
