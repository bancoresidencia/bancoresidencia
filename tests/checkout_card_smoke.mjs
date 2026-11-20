import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd());
const key = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;
assert.ok(key, 'Set the Mercado Pago public key before running this test.');
const manifest = JSON.parse(await readFile('.next/routes-manifest.json', 'utf8'));
const policy = manifest.headers.flatMap(route => route.headers).find(h => h.key === 'Content-Security-Policy');
assert.ok(policy, 'Run next build to obtain the deployed CSP.');
const { outputFiles } = await build({
  stdin: { contents: `
    import { createRoot } from 'react-dom/client';
    import { initMercadoPago } from '@mercadopago/sdk-react';
    import { CheckoutCardForm } from './src/components/CheckoutCardForm';
    initMercadoPago(${JSON.stringify(key)}, {locale: 'pt-BR'});
    createRoot(document.getElementById('root')).render(<CheckoutCardForm amount={49.9} maxInstallments={1}
      dark={false} color="#222222" onSubmit={async () => { throw Error('No payment handler in rendering test'); }} />);
  `, resolveDir: process.cwd(), loader: 'tsx' },
  jsx: 'automatic', bundle: true, write: false, define: { 'process.env.NODE_ENV': '"production"' }
});
const server = http.createServer((req, res) => {
  res.setHeader(policy.key, policy.value);
  if (req.url === '/ui.js') {
    res.setHeader('Content-Type', 'text/javascript');
    res.end(outputFiles[0].contents);
  } else {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<div id="root"></div><script src="/ui.js"></script>');
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:' + server.address().port);
  await page.getByText('Número do cartão', { exact: true }).first().waitFor();
  assert.ok(await page.locator('#cardPaymentBrick_container iframe').count() >= 3);
  console.log('Hosted card fields rendered under the built CSP.');
} finally {
  await browser?.close();
  server.close();
}
