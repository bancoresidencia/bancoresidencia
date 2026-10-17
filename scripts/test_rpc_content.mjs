import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('medevo.com.br'));

  const result = await page.evaluate(async () => {
    // Intercepta token do localStorage
    const raw = localStorage.getItem('medevo-auth-storage');
    const auth = JSON.parse(raw);
    const token = auth.access_token;

    // Busca a apikey das requisições ou usa o anon key
    // Dispara a RPC exatamente como a página faz:
    const res = await fetch('https://data.medevo.com.br/rest/v1/rpc/get_study_material_content_secure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZWRwZG1ndmdhdGpkZnhneGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4NTUwNDAsImV4cCI6MjAyNTQzMTA0MH0.x'
      },
      body: JSON.stringify({ material_id: 'b07e7b68-80f4-4a41-b6a4-6bc38c3e8006' })
    });

    const status = res.status;
    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      data = await res.text();
    }
    return { status, dataKeys: typeof data === 'object' && data !== null ? Object.keys(data) : typeof data, data };
  });

  console.log('Status da RPC:', result.status);
  console.log('Keys do resultado:', result.dataKeys);
  if (result.status === 200) {
    console.log('Amostra de conteúdo/referências:\n', JSON.stringify(result.data).slice(0, 1000));
  } else {
    console.log('Erro:', result.data);
  }
}

main().catch(console.error);
