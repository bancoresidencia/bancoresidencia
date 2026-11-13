async function checkSource3() {
  const u = 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGvLZRKXu-Alz_xESETJTNszySuRs2DqD76lN9i1oMjuy2K0FWAiP0nbmddiuh68Q1lQVCkqScCgfnoQYgMsYsrxtqc0qcSohePkoZO_S2hbCvgvIY1_y3eb6SzHP1ROhsoGipegBLyCg==';
  const res = await fetch(u, { redirect: 'manual' });
  console.log('Location:', res.headers.get('location'));
}
checkSource3();
