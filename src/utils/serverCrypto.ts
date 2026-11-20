import crypto from 'node:crypto';

/**
 * Comparação criptográfica em tempo constante resistente a ataques de temporização (Timing Attacks).
 */
export function timingSafeEqualStrings(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.byteLength !== bufB.byteLength) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Deriva uma subchave criptográfica isolada de 256 bits via HKDF-SHA256 (RFC 5869),
 * impedindo reutilização direta de segredos mestres (como SUPABASE_SERVICE_ROLE_KEY) em múltiplos contextos.
 */
export function deriveDomainSecret(masterSecret: string, domainInfo: string): Buffer {
  if (!masterSecret || !domainInfo) {
    throw new Error('Segredo mestre e identificador de domínio são obrigatórios para derivação HKDF.');
  }
  const derived = crypto.hkdfSync(
    'sha256',
    Buffer.from(masterSecret, 'utf8'),
    Buffer.from('bancoresidencia-hkdf-domain-salt-v1', 'utf8'),
    Buffer.from(domainInfo, 'utf8'),
    32
  );
  return Buffer.from(derived);
}
