import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';

export interface UrlValidationResult {
  allowed: boolean;
  normalizedUrl?: string;
  reason?: string;
}

function parseIpv4Bytes(ip: string): Uint8Array | null {
  if (!net.isIPv4(ip)) return null;
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  const out = new Uint8Array(4);
  for (let i = 0; i < 4; i++) {
    const n = Number(parts[i]);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    out[i] = n;
  }
  return out;
}

function isPrivateOrReservedIpv4Bytes(b: Uint8Array): boolean {
  const [o0, o1, o2] = b;
  if (o0 === 0 || o0 === 10 || o0 === 127) return true;
  if (o0 === 100 && o1 >= 64 && o1 <= 127) return true; // CGNAT RFC 6598 (100.64.0.0/10)
  if (o0 === 169 && o1 === 254) return true; // Link-Local & Cloud Metadata (169.254.0.0/16)
  if (o0 === 172 && o1 >= 16 && o1 <= 31) return true; // Private RFC 1918 (172.16.0.0/12)
  if (o0 === 192 && o1 === 0 && o2 === 0) return true; // IETF Protocol Assignments (192.0.0.0/24)
  if (o0 === 192 && o1 === 0 && o2 === 2) return true; // TEST-NET-1 (192.0.2.0/24)
  if (o0 === 192 && o1 === 168) return true; // Private RFC 1918 (192.168.0.0/16)
  if (o0 === 198 && (o1 === 18 || o1 === 19)) return true; // Benchmarking (198.18.0.0/15)
  if (o0 === 198 && o1 === 51 && o2 === 100) return true; // TEST-NET-2 (198.51.100.0/24)
  if (o0 === 203 && o1 === 0 && o2 === 113) return true; // TEST-NET-3 (203.0.113.0/24)
  if (o0 >= 224) return true; // Multicast & Reserved (224.0.0.0/4, 240.0.0.0/4)
  return false;
}

/**
 * Converte qualquer endereço IPv6 válido (comprimido, expandido, hexadecimal ou híbrido IPv4)
 * em seus 16 octetos exatos (128 bits), impedindo bypasses de representação como ::ffff:a9fe:a9fe.
 */
export function parseIpv6Bytes(rawIp: string): Uint8Array | null {
  const ip = rawIp.trim().toLowerCase().replace(/^\[|\]$/g, '');
  if (!ip || ip.includes('%') || !net.isIPv6(ip)) return null;

  let working = ip;
  let embeddedIpv4: Uint8Array | null = null;

  const lastColon = working.lastIndexOf(':');
  if (lastColon !== -1 && working.slice(lastColon + 1).includes('.')) {
    const v4Part = working.slice(lastColon + 1);
    embeddedIpv4 = parseIpv4Bytes(v4Part);
    if (!embeddedIpv4) return null;
    working = `${working.slice(0, lastColon)}:0:0`;
  }

  const doubleColonParts = working.split('::');
  if (doubleColonParts.length > 2) return null;

  let hextets: string[] = [];
  if (doubleColonParts.length === 2) {
    const left = doubleColonParts[0] ? doubleColonParts[0].split(':') : [];
    const right = doubleColonParts[1] ? doubleColonParts[1].split(':') : [];
    const missing = 8 - (left.length + right.length);
    if (missing < 1) return null;
    hextets = [...left, ...Array<string>(missing).fill('0'), ...right];
  } else {
    hextets = working.split(':');
  }

  if (hextets.length !== 8) return null;

  const bytes = new Uint8Array(16);
  for (let i = 0; i < 8; i++) {
    const val = parseInt(hextets[i], 16);
    if (!Number.isInteger(val) || val < 0 || val > 0xffff) return null;
    bytes[i * 2] = (val >> 8) & 0xff;
    bytes[i * 2 + 1] = val & 0xff;
  }

  if (embeddedIpv4) {
    bytes.set(embeddedIpv4, 12);
  }

  return bytes;
}

/**
 * Verifica se um endereço IPv4 ou IPv6 pertence a faixas privadas, loopback,
 * link-local, metadados de nuvem (169.254.169.254 / ::ffff:a9fe:a9fe), NAT64, 6to4, Teredo ou reservadas.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  const clean = (ip || '').trim().toLowerCase().replace(/^\[|\]$/g, '');
  if (!clean || clean.includes('%')) return true;

  const v4 = parseIpv4Bytes(clean);
  if (v4) {
    return isPrivateOrReservedIpv4Bytes(v4);
  }

  const v6 = parseIpv6Bytes(clean);
  if (!v6) {
    return true; // Fail-closed para qualquer formato inválido ou ambíguo
  }

  // 1. ::/96 (inclui ::/128 não especificado, ::1/128 loopback e ::ipv4 compatível depreciado)
  const isFirst96Zero = v6.subarray(0, 12).every((b) => b === 0);
  if (isFirst96Zero) {
    return true;
  }

  // 2. ::ffff:0:0/96 (IPv4-mapped IPv6 tanto decimal quanto hexadecimal, ex: ::ffff:7f00:1 e ::ffff:a9fe:a9fe)
  const isIpv4Mapped =
    v6.subarray(0, 10).every((b) => b === 0) && v6[10] === 0xff && v6[11] === 0xff;
  if (isIpv4Mapped) {
    return isPrivateOrReservedIpv4Bytes(v6.subarray(12, 16));
  }

  // 3. ::ffff:0:0:0/96 (IPv4-translated SIIT RFC 2765)
  const isSiitTranslated =
    v6.subarray(0, 8).every((b) => b === 0) &&
    v6[8] === 0xff &&
    v6[9] === 0xff &&
    v6[10] === 0 &&
    v6[11] === 0;
  if (isSiitTranslated) {
    return isPrivateOrReservedIpv4Bytes(v6.subarray(12, 16));
  }

  // 4. 64:ff9b::/96 e 64:ff9b:1::/48 (NAT64 Well-Known & Local-Use — extrai os 32 bits IPv4 finais)
  if (v6[0] === 0x00 && v6[1] === 0x64 && v6[2] === 0xff && v6[3] === 0x9b) {
    return true;
  }

  // 5. 100::/64 (Discard-Only RFC 6666)
  if (
    v6[0] === 0x01 &&
    v6[1] === 0x00 &&
    v6.subarray(2, 8).every((b) => b === 0)
  ) {
    return true;
  }

  // 6. 2001::/32 (Teredo), 2001:2::/48 (Benchmarking), 2001:db8::/32 (Documentação), 2001:10::/28 & 2001:20::/28
  if (v6[0] === 0x20 && v6[1] === 0x01) {
    if (v6[2] === 0x00 && v6[3] === 0x00) return true; // Teredo
    if (v6[2] === 0x00 && v6[3] === 0x02 && v6[4] === 0x00 && v6[5] === 0x00) return true; // Benchmarking
    if (v6[2] === 0x0d && v6[3] === 0xb8) return true; // Documentation
    if (v6[2] === 0x00 && (v6[3] & 0xf0) === 0x10) return true; // ORCHID
    if (v6[2] === 0x00 && (v6[3] & 0xf0) === 0x20) return true; // ORCHIDv2
  }

  // 7. 2002::/16 (6to4 — embute IPv4 nos bytes 2..5, ex: 2002:7f00:0001:: ou 2002:a9fe:a9fe::)
  if (v6[0] === 0x20 && v6[1] === 0x02) {
    return isPrivateOrReservedIpv4Bytes(v6.subarray(2, 6));
  }

  // 8. fc00::/7 (Unique Local), fe80::/10 (Link-Local), fec0::/10 (Site-Local), ff00::/8 (Multicast)
  if ((v6[0] & 0xfe) === 0xfc) return true; // fc00::/7
  if (v6[0] === 0xfe && (v6[1] & 0xc0) === 0x80) return true; // fe80::/10
  if (v6[0] === 0xfe && (v6[1] & 0xc0) === 0xc0) return true; // fec0::/10
  if (v6[0] === 0xff) return true; // ff00::/8

  return false;
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

  const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (
    net.isIP(host) !== 0 ||
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
 * Valida URL externa de imagem (com checagem de formato + resolução DNS contra IPs internos em IPv4 e IPv6 hex).
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
    const records = await dnsPromises.lookup(host, { all: true });
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
 * Lookup DNS com Pinning Anti-DNS-Rebinding (TOCTOU): valida o IP resolvido no exato momento
 * da abertura do socket TCP/TLS, bloqueando qualquer transição TTL=0 para 127.0.0.1 / 169.254.169.254.
 */
const safePinnedLookup: net.LookupFunction = (hostname, options, callback) => {
  const cleanHost = hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(cleanHost) !== 0) {
    if (isPrivateOrReservedIp(cleanHost)) {
      callback(new Error('SSRF_BLOCKED_IP: Conexão para IP privado ou reservado bloqueada.'), '', 4);
      return;
    }
    const fam = net.isIPv6(cleanHost) ? 6 : 4;
    if (options && typeof options === 'object' && options.all) {
      callback(null, [{ address: cleanHost, family: fam }]);
    } else {
      callback(null, cleanHost, fam);
    }
    return;
  }

  dns.lookup(hostname, { all: true }, (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      callback(err || new Error('DNS_RESOLUTION_FAILED'), '', 4);
      return;
    }

    for (const entry of addresses) {
      if (isPrivateOrReservedIp(entry.address)) {
        callback(new Error('SSRF_DNS_REBINDING_BLOCKED: O domínio resolveu para um IP interno proibido.'), '', 4);
        return;
      }
    }

    if (options && typeof options === 'object' && options.all) {
      callback(null, addresses);
    } else {
      callback(null, addresses[0].address, addresses[0].family);
    }
  });
};

/**
 * Executa requisição HTTP/HTTPS com:
 * 1. Pinning de IP no socket (imune a DNS Rebinding TOCTOU);
 * 2. Bloqueio estrito de redirecionamentos 3xx (imune a Open Redirect -> SSRF);
 * 3. Teto rígido de bytes no stream (imune a OOM).
 */
export async function safeFetchBufferWithLimit(
  url: string,
  maxBytes: number,
  timeoutMs = 8000,
  headers?: Record<string, string>
): Promise<{ status: number; ok: boolean; buffer: Buffer; contentType: string }> {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('Protocolo de URL não permitido.');
  }

  const transport = parsed.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    let settled = false;
    const finishError = (err: Error) => {
      if (settled) return;
      settled = true;
      reject(err);
    };

    const req = transport.request(
      parsed,
      {
        method: 'GET',
        headers: {
          Host: parsed.host,
          ...headers
        },
        lookup: safePinnedLookup,
        servername: net.isIP(parsed.hostname.replace(/^\[|\]$/g, '')) === 0 ? parsed.hostname : undefined,
        timeout: timeoutMs
      },
      (res) => {
        const status = res.statusCode || 0;

        if (status >= 300 && status < 400) {
          res.resume();
          req.destroy();
          finishError(new Error('Redirecionamentos externos são bloqueados por política de segurança.'));
          return;
        }

        const contentLength = parseInt(String(res.headers['content-length'] || '0'), 10);
        if (contentLength > maxBytes) {
          res.resume();
          req.destroy();
          finishError(new Error(`Payload excede o limite máximo permitido (${Math.round(maxBytes / (1024 * 1024))}MB).`));
          return;
        }

        const chunks: Buffer[] = [];
        let totalBytes = 0;

        res.on('data', (chunk: Buffer | Uint8Array) => {
          const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          totalBytes += buf.byteLength;
          if (totalBytes > maxBytes) {
            res.destroy();
            req.destroy();
            finishError(new Error(`Payload excede o limite máximo permitido (${Math.round(maxBytes / (1024 * 1024))}MB).`));
            return;
          }
          chunks.push(buf);
        });

        res.on('end', () => {
          if (settled) return;
          settled = true;
          resolve({
            status,
            ok: status >= 200 && status < 300,
            buffer: Buffer.concat(chunks),
            contentType: String(res.headers['content-type'] || '')
          });
        });

        res.on('error', (streamErr) => {
          finishError(streamErr instanceof Error ? streamErr : new Error(String(streamErr)));
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      finishError(new Error('Request timeout atingido.'));
    });

    req.on('error', (reqErr) => {
      finishError(reqErr instanceof Error ? reqErr : new Error(String(reqErr)));
    });

    req.end();
  });
}
