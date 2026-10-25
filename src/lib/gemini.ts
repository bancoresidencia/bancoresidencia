/**
 * Utilitário centralizado e resiliente para chamadas à Google Gemini API
 * Suporta rotação de chaves e fallback automático entre modelos.
 */

export function getAvailableGeminiKey(): string | null {
  const envKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5
  ].filter((k): k is string => Boolean(k && k.trim().length > 10));

  if (envKeys.length > 0) {
    const randomIdx = Math.floor(Math.random() * envKeys.length);
    return envKeys[randomIdx];
  }
  return null;
}

export const CANDIDATE_GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3-flash-preview',
  'gemini-2.5-flash'
];

interface CallGeminiOptions {
  temperature?: number;
  responseMimeType?: 'application/json' | 'text/plain';
}

export async function callGeminiAi(prompt: string, options: CallGeminiOptions = {}): Promise<string> {
  const geminiKey = getAvailableGeminiKey();
  if (!geminiKey) {
    throw new Error('Nenhuma chave de API Gemini (GEMINI_API_KEY) configurada no ambiente.');
  }

  const { temperature = 0.2, responseMimeType = 'application/json' } = options;

  let lastError: Error | null = null;
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
        console.warn(`[Gemini API] Falha no modelo ${model} (${res.status}):`, errText.slice(0, 200));
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      lastError = error;
      console.warn(`[Gemini API] Erro de rede ou chamada com modelo ${model}:`, error.message);
    }
  }

  throw lastError || new Error('Não foi possível obter resposta de nenhum dos modelos Gemini disponíveis.');
}
