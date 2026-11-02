import crypto from 'crypto';
import { callGeminiAi } from './gemini';

/**
 * Utilitário Canônico de Conexão com Google Cloud Vertex AI
 * Suporta Service Account nativa (GCP $300 Credits) com geração de token OAuth2 via RS256 puro
 * e fallback automático para o pool de chaves do Google AI Studio caso as credenciais GCP ainda não estejam configuradas.
 */

export interface VertexAiCredentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  location?: string;
}

export interface VertexCallParams {
  prompt: string;
  systemInstruction?: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: 'text/plain' | 'application/json';
}

export interface VertexCallResult {
  success: boolean;
  content: string;
  provider: 'vertex_ai' | 'google_ai_studio_fallback';
  modelUsed: string;
  error?: string;
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

/**
 * Obtém as credenciais do GCP a partir de variáveis de ambiente
 */
export function getVertexCredentials(): VertexAiCredentials | null {
  const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || '';
  const clientEmail = process.env.GCP_CLIENT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL || '';
  let privateKey = process.env.GCP_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY || '';

  if (!projectId || !clientEmail || !privateKey) {
    if (process.env.GCP_SERVICE_ACCOUNT_KEY) {
      try {
        const parsed = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY);
        return {
          projectId: parsed.project_id || '',
          clientEmail: parsed.client_email || '',
          privateKey: (parsed.private_key || '').replace(/\\n/g, '\n'),
          location: process.env.GCP_LOCATION || 'us-central1'
        };
      } catch (e) {
        console.warn('[VertexAI] Falha ao fazer parse de GCP_SERVICE_ACCOUNT_KEY:', e);
      }
    }
    return null;
  }

  privateKey = privateKey.replace(/\\n/g, '\n');

  return {
    projectId: projectId.trim(),
    clientEmail: clientEmail.trim(),
    privateKey: privateKey.trim(),
    location: process.env.GCP_LOCATION || 'us-central1'
  };
}

/**
 * Gera um token OAuth2 do Google Cloud via Service Account usando RS256 nativo (sem dependências externas)
 */
async function getGoogleCloudAccessToken(creds: VertexAiCredentials): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 300) {
    return cachedAccessToken.token;
  }

  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const claim = {
    iss: creds.clientEmail,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const base64UrlEncode = (obj: Record<string, unknown>) => {
    return Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  const unsignedToken = `${base64UrlEncode(header)}.${base64UrlEncode(claim)}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  signer.end();

  const signature = signer.sign(creds.privateKey, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${unsignedToken}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    }).toString()
  });

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    throw new Error(`[VertexAI] Erro ao obter access token OAuth2: ${tokenRes.status} - ${errorText}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;
  const expiresIn = tokenData.expires_in || 3600;

  cachedAccessToken = {
    token: accessToken,
    expiresAt: now + expiresIn
  };

  return accessToken;
}

/**
 * Executa uma chamada de inferência ao Vertex AI (Gemini ou Claude)
 * Se as credenciais do GCP não estiverem presentes, usa fallback transparente para Google AI Studio.
 */
export async function callVertexAi(params: VertexCallParams): Promise<VertexCallResult> {
  const creds = getVertexCredentials();

  const fullPromptForStudio = params.systemInstruction
    ? `${params.systemInstruction}\n\n${params.prompt}`
    : params.prompt;

  // FALLBACK SEGURO: se ainda não configurou as credenciais GCP, roda via AI Studio gratuito
  if (!creds) {
    console.warn('[VertexAI] Credenciais GCP não configuradas no .env.local. Executando fallback via Google AI Studio...');
    try {
      const studioContent = await callGeminiAi(fullPromptForStudio, {
        temperature: params.temperature ?? 0.2,
        responseMimeType: params.responseMimeType
      });
      return {
        success: true,
        content: studioContent,
        provider: 'google_ai_studio_fallback',
        modelUsed: 'gemini-flash-studio-pool'
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        content: '',
        provider: 'google_ai_studio_fallback',
        modelUsed: 'none',
        error: `Falha no Vertex AI (sem credenciais) e falha no fallback AI Studio: ${errorMessage}`
      };
    }
  }

  const model = params.model || 'gemini-1.5-flash-002';
  const location = creds.location || 'us-central1';

  try {
    const accessToken = await getGoogleCloudAccessToken(creds);

    const isClaude = model.includes('claude');
    let endpointUrl = '';
    let requestBody: Record<string, unknown> = {};

    if (isClaude) {
      endpointUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${creds.projectId}/locations/${location}/publishers/anthropic/models/${model}:rawPredict`;
      requestBody = {
        anthropic_version: 'vertex-2023-10-16',
        messages: [
          { role: 'user', content: params.prompt }
        ],
        max_tokens: params.maxOutputTokens || 4096,
        temperature: params.temperature ?? 0.2,
        system: params.systemInstruction || ''
      };
    } else {
      endpointUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${creds.projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;
      
      const contents: Array<Record<string, unknown>> = [
        {
          role: 'user',
          parts: [{ text: params.prompt }]
        }
      ];

      requestBody = {
        contents,
        generationConfig: {
          temperature: params.temperature ?? 0.2,
          maxOutputTokens: params.maxOutputTokens || 8192,
          responseMimeType: params.responseMimeType || 'text/plain'
        }
      };

      if (params.systemInstruction) {
        requestBody.systemInstruction = {
          parts: [{ text: params.systemInstruction }]
        };
      }
    }

    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[VertexAI] Erro HTTP ${response.status}:`, errText);
      
      console.warn('[VertexAI] Ativando fallback para Google AI Studio...');
      const fallbackContent = await callGeminiAi(fullPromptForStudio, {
        temperature: params.temperature ?? 0.2,
        responseMimeType: params.responseMimeType
      });
      return {
        success: true,
        content: fallbackContent,
        provider: 'google_ai_studio_fallback',
        modelUsed: 'gemini-flash-studio-pool'
      };
    }

    const data = await response.json();
    let text = '';

    if (isClaude) {
      text = data?.content?.[0]?.text || '';
    } else {
      text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    return {
      success: true,
      content: text,
      provider: 'vertex_ai',
      modelUsed: model
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[VertexAI] Falha na execução:', errorMsg);

    try {
      const fallbackContent = await callGeminiAi(fullPromptForStudio, {
        temperature: params.temperature ?? 0.2,
        responseMimeType: params.responseMimeType
      });
      return {
        success: true,
        content: fallbackContent,
        provider: 'google_ai_studio_fallback',
        modelUsed: 'gemini-flash-studio-pool'
      };
    } catch {
      return {
        success: false,
        content: '',
        provider: 'vertex_ai',
        modelUsed: model,
        error: errorMsg
      };
    }
  }
}
