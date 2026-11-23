async function resolve() {
  const u = "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEIxlsNaYuO0JeWYcAC8b4VwMLXQH_IFO0d-soa1R8U1kaYB_mJrQ4To9waQ2WFAzDYmCN6_bOrNzSjXMLJfZdXQuZULyIF2Xoo0YrYXaKn801XYOsiKeehAvL8S3LUZAAnBxTD9WPxvGltuWxTQ5oI8s8kIuNXs9IRgn12S6PWtzP5mG2aHu4=";
  const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow' });
  console.log('Resolved URL:', res.url);
  const text = await res.text();
  const imgs = text.match(/\/api\/images\/content\/[^\s"']+/gi) || [];
  console.log('Images:', imgs);
}
resolve();
