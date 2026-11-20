import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyPaymentWebhook(headers: Headers, paymentId: string, secret: string | undefined, now = Date.now()) {
  if (!secret || !paymentId) return false;
  const signature = headers.get('x-signature') || '';
  const entries = signature.split(',').map(part => part.trim().split('='));
  const { ts, v1 } = Object.fromEntries(entries);
  if (!/^\d+$/.test(ts || '') || !/^[a-f\d]{64}$/i.test(v1 || '')) return false;
  const timestamp = Number(ts);
  const timeMs = timestamp < 1e12 ? timestamp * 1000 : timestamp;
  if (Math.abs(now - timeMs) > 5 * 60 * 1000) return false;
  const requestId = headers.get('x-request-id');
  const manifest = `id:${paymentId.toLowerCase()};${requestId ? `request-id:${requestId};` : ''}ts:${ts};`;
  const expected = createHmac('sha256', secret).update(manifest).digest();
  return timingSafeEqual(expected, Buffer.from(v1, 'hex'));
}
