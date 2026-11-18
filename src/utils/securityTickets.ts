import crypto from 'crypto';

/**
 * Utilitário de Bilhetagem de Sessão Efêmera (Session Binding)
 * Banco Residência Médica
 *
 * Garante que apenas questões legitimamente entregues ao aluno naquela página
 * possam ter seus gabaritos e comentários pré-carregados pelo /api/questions/solve-batch.
 * Utiliza derivação de chave HKDF-SHA256 com separação criptográfica de domínio.
 */

function deriveTicketDomainSecret(masterSecret: string): Buffer {
  return Buffer.from(
    crypto.hkdfSync(
      'sha256',
      Buffer.from(masterSecret, 'utf8'),
      Buffer.from('bancoresidencia-hkdf-domain-salt-v1', 'utf8'),
      Buffer.from('session-ticket-hmac-v1', 'utf8'),
      32
    )
  );
}

function getTicketHmacKey(): Buffer {
  const secret = process.env.GUEST_QUOTA_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('GUEST_QUOTA_SECRET ou SUPABASE_SERVICE_ROLE_KEY obrigatório em produção.');
    }
    return deriveTicketDomainSecret('bancoresidencia-session-ticket-secret-key-32b');
  }
  return deriveTicketDomainSecret(secret);
}

export interface SessionTicketPayload {
  userId: string;
  questionIds: string[];
  expiresAt: number;
}

/**
 * Gera um ticket assinado (HMAC-SHA256 c/ HKDF) com validade curta (padrão: 3 minutos)
 */
export function generateSessionTicket(
  userId: string,
  questionIds: string[],
  expiresInSeconds: number = 180
): string {
  const payload: SessionTicketPayload = {
    userId: userId || 'anonymous',
    questionIds: questionIds || [],
    expiresAt: Date.now() + expiresInSeconds * 1000
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getTicketHmacKey())
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

export interface VerifyTicketResult {
  isValid: boolean;
  userId?: string;
  questionIds?: string[];
  error?: string;
}

/**
 * Valida a autenticidade e a autorização de um Session Ticket para os IDs solicitados
 */
export function verifySessionTicket(
  ticketString: string | null | undefined,
  requestedIds?: string[],
  expectedUserId?: string
): VerifyTicketResult {
  if (!ticketString || typeof ticketString !== 'string') {
    return { isValid: false, error: 'Ticket de sessão ausente.' };
  }

  const parts = ticketString.split('.');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Formato de ticket inválido.' };
  }

  const [payloadB64, signature] = parts;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', getTicketHmacKey())
      .update(payloadB64)
      .digest('base64url');

    const sigBuf = Buffer.from(signature, 'utf8');
    const expBuf = Buffer.from(expectedSignature, 'utf8');
    if (sigBuf.byteLength !== expBuf.byteLength || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { isValid: false, error: 'Assinatura do ticket inválida ou forjada.' };
    }

    const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload: SessionTicketPayload = JSON.parse(jsonStr);

    if (Date.now() > payload.expiresAt) {
      return { isValid: false, error: 'Ticket de sessão expirado.' };
    }

    if (expectedUserId && payload.userId !== expectedUserId) {
      return { isValid: false, error: 'Ticket não pertence ao usuário autenticado.' };
    }

    if (requestedIds && requestedIds.length > 0) {
      const allowedSet = new Set(payload.questionIds);
      const unauthorizedIds = requestedIds.filter((id) => !allowedSet.has(id));
      if (unauthorizedIds.length > 0) {
        return {
          isValid: false,
          error: `O ticket não autoriza os IDs solicitados (${unauthorizedIds.length} não autorizados).`
        };
      }
    }

    return {
      isValid: true,
      userId: payload.userId,
      questionIds: payload.questionIds
    };
  } catch {
    return { isValid: false, error: 'Falha ao processar ticket de sessão.' };
  }
}
