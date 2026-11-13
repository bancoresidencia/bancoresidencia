async function checkQconcursos() {
  const u = 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGiCO0fYEuBNWhtYKvb_7eB9v2T-OUGKU9_PuMoadeReljQGy931F9bQ0VAMSYX0Wzxk2UwgpUMz5rtXz2ESmzJAZZN9IFYk6mY1f_Fdey2-UYZWurJIWUyYquom8gkKaeDKuvb8QdMyXvZ568asBr68WO-dVgWeuCpEew=';
  const res = await fetch(u, { redirect: 'manual' });
  console.log('Location:', res.headers.get('location'));
}
checkQconcursos();
