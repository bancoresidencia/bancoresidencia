async function checkMedbrave() {
  const url = 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEbqMDKvty8uoxSLOxskIqp1CBNWhp-y-GCBGQ3NdtJ0T_xJ9C3ThW5YtmMS0N5OfLkPxBlTGjwhrJqARfDtlTlYdD3tm65UUHtdeZtxK1M6M21l8yJ5YDTgUqTwyuC485AxhKWXJ2V_rcsGSKvzjVXHdzNrdOacT8somR2QnBo4nDe9Y0VUOs4nz2GBDPUsU7P_hxU';
  const res = await fetch(url, { redirect: 'manual' });
  const location = res.headers.get('location');
  console.log('Medbrave Location:', location);

  if (location) {
    const pageRes = await fetch(location, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await pageRes.text();
    console.log('Page HTML length:', html.length);
    const imgMatches = html.match(/https?:\/\/[^"'\s]+\.(?:png|jpg|jpeg|webp)/gi) || [];
    console.log('Images found:', imgMatches);
  }
}

checkMedbrave().catch(console.error);
