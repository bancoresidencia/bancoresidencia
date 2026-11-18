import dns from 'node:dns/promises';
import net from 'node:net';

export interface UrlValidationResult {
  allowed: boolean;
  normalizedUrl?: string;
  reason?: string;
}

/**
 * Verifica se um endereço IPv4 ou IPv6 pertence a faixas privadas, loopback,
 * link-local, metadados de nuvem (169.254.169.254), CGNAT ou reservadas.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  const clean = ip.trim().toLowerCase().replace(/^\[|\]$/g, '');

  // IPv4-mapped IPv6 (ex: ::ffff:127.0.0.1 ou ::ffff:169.254.169.254)
  if (clean.startsWith('::ffff:')) {
    const mappedV4 = clean.slice(7);
    if (net.isIPv4(mappedV4)) {
      return isPrivateOrReservedIp(mappedV4);
    }
  }

  if (net.isIPv4(clean)) {
    const parts = clean.split('.').map(Number);
    const [a, b] = parts;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true; // Cloud Metadata / Link-local
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT RFC 6598
    if (a === 198 && (b === 18 || b === 19)) return true; // Benchmarking
    if (a >= 224) return true; // Multicast & Reserved
    return false;
  }

  if (net.isIPv6(clean)) {
    if (clean === '::1' || clean === '::' || clean === '0:0:0:0:0:0:0:1' || clean === '0:0:0:0:0:0:0:0') {
      return true;
    }
    if (clean.startsWith('fc') || clean.startsWith('fd')) return true; // Unique Local (fc00::/7)
    if (clean.startsWith('fe8') || clean.startsWith('fe9') || clean.startsWith('fea') || clean.startsWith('feb')) {
      return true; // Link-Local (fe80::/10)
    }
    if (clean.startsWith('ff')) return true; // Multicast
    return false;
  }

  // Qualquer formato não reconhecido falha de forma segura (fail-closed)
  return true;
}

const ALLOWED_ICAL_DOMAINS = [
  'calendar.google.com',
  'outlook.live.com',
  'outlook.office.com',
  'outlook.office365.com',
  'icloud.com'
];

/**
 * Valida estritamente URLs de calendário iCal (.ics) sem consultar rede.
 * Nota: 'google.com' raiz NÃO é aceito para impedir SSRF via script.google.com.
 */
export function validateIcalUrlFormat(rawUrl: string): UrlValidationResult {
  let url = (rawUrl || '').trim();
  if (!url) {
    return { allowed: false, reason: 'Por favor, cole o link secreto (.ics) da sua agenda.' };
  }

  if (url.startsWith('webcal://')) {
    url = 'https://' + url.slice('webcal://'.length);
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { allowed: false, reason: 'Formato de link inválido. Certifique-se de que a URL é válida.' };
  }

  if (parsed.protocol !== 'https:') {
    return { allowed: false, reason: 'Por motivos de segurança, o link deve usar obrigatoriamente HTTPS seguro (https://).' };
  }

  if (parsed.username || parsed.password) {
    return { allowed: false, reason: 'Credenciais embutidas na URL não são permitidas.' };
  }

  const host = parsed.hostname.toLowerCase();
  if (
    net.isIP(host.replace(/^\[|\]$/g, '')) !== 0 ||
    /^\d+$/.test(host) ||
    /^0x[0-9a-f]+$/i.test(host) ||
    host === 'localhost' ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    return { allowed: false, reason: 'Endereços IP diretos ou locais não são permitidos por segurança.' };
  }

  const isAllowed = ALLOWED_ICAL_DOMAINS.some((d) => host === d || host.endsWith('.' + d));
  if (!isAllowed) {
    return {
      allowed: false,
      reason:
        'Por motivos de segurança, são aceitos apenas endereços de agenda oficiais do Google Agenda (calendar.google.com), Microsoft Outlook ou Apple iCloud.'
    };
  }

  return { allowed: true, normalizedUrl: parsed.toString() };
}

/**
 * Valida URL externa de imagem (com checagem de formato + resolução DNS contra DNS Rebinding/IPs internos).
 */
export async function validateExternalImageUrl(rawUrl: string): Promise<UrlValidationResult> {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return { allowed: false, reason: 'URL da imagem ausente.' };

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { allowed: false, reason: 'URL inválida.' };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { allowed: false, reason: 'Protocolo de URL não permitido.' };
  }

  if (parsed.username || parsed.password) {
    return { allowed: false, reason: 'Credenciais na URL não permitidas.' };
  }

  const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (
    host === 'localhost' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    /^\d+$/.test(host) ||
    /^0x[0-9a-f]+$/i.test(host) ||
    /medevo\.com\.br/i.test(host)
  ) {
    return { allowed: false, reason: 'Destino de URL proibido por política de segurança.' };
  }

  if (net.isIP(host) !== 0) {
    if (isPrivateOrReservedIp(host)) {
      return { allowed: false, reason: 'Endereço IP privado ou reservado proibido.' };
    }
    return { allowed: true, normalizedUrl: parsed.toString() };
  }

  try {
    const records = await dns.lookup(host, { all: true });
    if (!records || records.length === 0) {
      return { allowed: false, reason: 'Não foi possível resolver o domínio informado.' };
    }
    for (const rec of records) {
      if (isPrivateOrReservedIp(rec.address)) {
        return { allowed: false, reason: 'Domínio resolve para faixa de rede interna proibida.' };
      }
    }
  } catch {
    return { allowed: false, reason: 'Falha ao validar resolução DNS segura do domínio.' };
  }

  return { allowed: true, normalizedUrl: parsed.toString() };
}

/**
 * Executa fetch bloqueando redirecionamentos HTTP (redirect: 'error') e impondo
 * teto estrito de bytes durante a leitura do stream para impedir OOM / SSRF Redirect.
 */
export async function safeFetchBufferWithLimit(
  url: string,
  maxBytes: number,
  timeoutMs = 8000,
  headers?: Record<string, string>
): Promise<{ status: number; ok: boolean; buffer: Buffer; contentType: string }> {
  const response = await fetch(url, {
    method: 'GET',
    headers,
    redirect: 'error',
    signal: AbortSignal.timeout(timeoutMs)
  });

  const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
  if (contentLength > maxBytes) {
    throw new Error(`Payload excede o limite máximo permitido (${Math.round(maxBytes / (1024 * 1024))}MB).`);
  }

  if (!response.body) {
    return {
      status: response.status,
      ok: response.ok,
      buffer: Buffer.alloc(0),
      contentType: response.headers.get('content-type') || ''
    };
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.byteLength;
        if (totalBytes > maxBytes) {
          await reader.cancel().catch(() => {});
          throw new Error(`Payload excede o limite máximo permitido (${Math.round(maxBytes / (1024 * 1024))}MB).`);
        }
        chunks.push(value);
      }
    }
  } finally {
    reader.releaseLock();
  }

  return {
    status: response.status,
    ok: response.ok,
    buffer: Buffer.concat(chunks.map((c) => Buffer.from(c))),
    contentType: response.headers.get('content-type') || ''
  };
}
