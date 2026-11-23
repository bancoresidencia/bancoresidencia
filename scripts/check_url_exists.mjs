async function test() {
  const url = 'https://ezluharxlmlqhdkqrjbz.supabase.co/storage/v1/object/public/questoes/ginecologia/mulher-de-29-anos-da-entrada-ou-ps-com-quadro-de-dor-abdomin-01.webp';
  const res = await fetch(url);
  console.log('HTTP status:', res.status, res.headers.get('content-type'), res.headers.get('content-length'));
}

test().catch(console.error);
