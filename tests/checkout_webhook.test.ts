import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { verifyPaymentWebhook } from '../src/utils/paymentWebhookSignature.ts';

const testSecret = 'unit-test-signing-key';
const now = Date.now();
for (const ts of [String(now), String(Math.floor(now / 1000))]) {
  for (const requestId of ['', 'request-123']) {
    const payload = 'id:a21;' + (requestId ? 'request-id:' + requestId + ';' : '') + 'ts:' + ts + ';';
    const digest = createHmac('sha256', testSecret).update(payload).digest('hex');
    const headers = new Headers({ 'x-signature': 'ts=' + ts + ',v1=' + digest });
    if (requestId) headers.set('x-request-id', requestId);
    assert.ok(verifyPaymentWebhook(headers, 'A21', testSecret, now));
    assert.ok(!verifyPaymentWebhook(headers, 'A21', undefined, now));
    assert.ok(!verifyPaymentWebhook(headers, 'A21', testSecret, now + 310000));
    assert.ok(!verifyPaymentWebhook(headers, 'A22', testSecret, now));
  }
}
assert.ok(!verifyPaymentWebhook(new Headers(), 'A21', testSecret));
console.log('Payment webhook signatures verified.');
