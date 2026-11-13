async function checkRedirects() {
  const urls = [
    'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQG8U3j8a1YjKFSmyC6Pr6qZcTPhl2XhRbo1Cau8NkpQ_iOKmhuJ5eIf6P88M_wgX6RHGdRhxyTpe0Li7FSu0S2NkT0uoW-DQNv-DRApyOXkKlAuLF25AsffZjuX3csZjnemyaeq',
    'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFQYrJVWL0o-KOjl5mtXCnXgec3db6bdlMCzodq4jhfPdP6IZ4zasDOCczCHBzgEptvUCumghCj2BHRlnGJvk0vCnZ0jAjSjIDJ61F37UzZak7Nwz5Qy54dzO-vspoF-gvu-A=='
  ];
  for (const u of urls) {
    const res = await fetch(u, { redirect: 'manual' });
    console.log(res.status, 'Location:', res.headers.get('location'));
  }
}
checkRedirects();
