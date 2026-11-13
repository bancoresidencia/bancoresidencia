async function testRedir() {
  const url = 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFXaIDKuaVBFcFEk2rZZJQW1aDrR2gXnsxmVBZbUIC-BjPLwxhDMRYJuqfvI3feBYa9U3G9iDaVU8pM8q5X6JURCqjY6kk-uzG_TTYTo3AE5ooQCnTEIa4N_X-NbQ6jTZEbg9L6sTPBROCy9seC3hHPZBUUGn_WeZzcfNnx_-mQEY71aRmQV2kNv__XXrxQRFrSIKA4UHHlQUM=';
  const res = await fetch(url, { redirect: 'manual' });
  console.log(res.status, 'Location:', res.headers.get('location'));
}
testRedir();
