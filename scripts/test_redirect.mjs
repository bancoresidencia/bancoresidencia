async function testRedirect() {
  const url = 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFYLLRQCy9OocM496KHTn7s8DA2Eg82PoGeLVhbbRl4QyzEE1R3FQuUoRxDCp6ro3Uz4xn1mRg33-RnTzsdEo6K7gltb7WLDkk02m1Scey0UsoR_pc58eaFKO-rDhh2Ebst8cLOkcJFT5N6dpA8NQxU0ObsEeZtWBl8Sd6I9nHVTQOt38VxIYsaun5jC9atBEbcX-Bt-3eeJOMVuC0=';
  const res = await fetch(url, { redirect: 'manual' });
  console.log('Status:', res.status, 'Location:', res.headers.get('location'));
}
testRedirect();

