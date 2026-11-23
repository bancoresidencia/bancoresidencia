const urls = [
  "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGLb2YQRu2GWPUG5P2zdVvr_JOUGv4-UHA-AyCls2c6fm7zC3JUYH2DDhk6c_Xnr_28COpzLPuLXALZwYI_eVyS8ici_79YZeKCVSr41dmed-HEPZW40wAv3-gpmmkC-zyEDyh6R1FeevVCxT0xcKmOdPeQUcO-qdm8pzfLcuDKM6zGsau-3Q==",
  "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEDTtdguq_6v6MXWzgMbzu-kDdSLqwpvusRWji9WiQBvoeoGlyob0nlj7DYOXM-vXveT94u2VtEi1vyAEYZHW96uJlUtVpZcYkYOGKWeJCZLCJvYWP-Dr_Y24VDiTv7XZFis7ORHSz3q-ThZ3tCAYWBM4pUNUeau1b6zwtAnzHePBLIeftjWCYDsSUz4rMtOyAB5YWgMqUb_w=="
];

async function check() {
  for (const u of urls) {
    const res = await fetch(u, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      redirect: 'follow'
    });
    console.log('Resolved:', res.url);
  }
}
check();
