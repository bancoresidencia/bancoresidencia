async function resolveRedirects() {
  const urls = [
    'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFqZ7GjfvwSq7B4JaQRFdl606L9Hc6wuVLXP6xMc_TG-mCRseZ5_5F4dSO6b8_mJoEbh35yHFSDjnM2wn3IqVEK0SzSW8UfcN704EL-PdHu3dg6w0rYrAzqdjzzhrMRT69p2541ZCG6z-o9aIFZgHmriS2IuRWUTjgy6wBqYV69N96F2KMYKUaPUMfwOHyBmwgTloOI2spCs1mi2IZ7V6iGPn2nzKkkXA==',
    'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHMDOwaXosA9N7qB-aHkVpV3GJWtTUDyWxemSL_WnGAWDUZcLidbEbix5EIybKsItcsBekJkXhdE6jJAoFVhyAshVxjHCbbjb4_mj_IjVBh_GHKVqyuGQk_aIH5EhljfLzsaXbgvtbQE8EMVF9HpjK9mxffYOP-nHE6bBoj5VxrUB0r62qi03UXOzmtuBMGFY0wV0c1eAwelw==',
    'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEbagcimIwWDvW0x1hFeCGAHrcSGSlPXjKxq_XgaIv3N2t65t3jmZS0g0ciQNgKnwKECAWo9sdrhbinNvXqdrFzqrr9jpOlDV0hwu1FVdO2iyVjCJ2B6fQ0XMeOjADQH7_3tsgbGlVGKVAbHTH8ruptJffAqFqTlxDjJPlmK5wAgo7Z2A=='
  ];

  for (let i = 0; i < urls.length; i++) {
    try {
      const res = await fetch(urls[i], { redirect: 'manual' });
      console.log(`Source [${i+1}] status: ${res.status}, Location: ${res.headers.get('location')}`);
    } catch (e) {
      console.error(e.message);
    }
  }
}
resolveRedirects();
