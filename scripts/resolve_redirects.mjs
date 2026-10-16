import https from 'https';

const targets = [
  'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFFP03Nt7W_pcQlCtXxLUONKeIAWDTl8kHm3ZPsAFsgi-rYSiPO8sDX8uyK34nMxx3Tb-4tgPRa1YcVMj7OEvDHs1H4fXU-tMGLIGrEy5HhF_5BBlCWHtYgXqJJO-4RFUjiCheXq2v7eWhFWRG7ffZcYvFLs7S1IZGMeawxvqcZeHJ9O1_aWcz7KM4xzUxNqPGyvB2e6aWyXIXGcc-hdSrpIpOszZxiuRFqYEh0MdcLi0x0',
  'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGieCMNk_L7h18KwEsrC0_NopopGZhtDYLcb1AJW-1DXlhsm5xbuyBEamZhT6RgsupT1UvnG8KS9sZCSxn0EKtw_4fmLfYW9-Du-bFnFbJRVZbh2rvdODl1402OpGN6dAIX4Ofezmz1f6Rbx4fS2AQGr3WuJcKDv0HWnXrq3xz0M6Osmey61I3xuveLNGaeAzMHYmO1YZpQdSS1mvEL2EG5dD7AJ3HKO0QHif_U4ehVeD5V4yI=',
  'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEmpiOGCCqb5NqX-tHuBzIL06FqkjLXi_4t955xUtFL9WrC_RBSevQiKSdGWPmfnLTOIVTmwGecu8clUBm15l1mK6rtxSbh0clg6_qsAT6i1ImdbdNK4hu--7G2GFWx3h_I1hZuaMOsE_epz0SVVXj7QrZXL6eJAnxz_gGJYbjXB1RbIqOAhTAIGwu8WENjTnW-axxSTNX3W6O3n82Gi5Sqw9KTCNcxOQ3J4M1XthJV0Sek',
  'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFNbbu1C08Qlfl1T9U6-NR8qlX3KNNLzyYU-zLCv2JjiIEHWCDXXnBMrArFTPGm-koAxUP_8GrlExh2ygsO-Glhz0-0WozsPU4NMCQl3fsm6HZ2FWTAyv3QmkMqXx_rJRY4TCD6J8AZ9r6GhP3w20UAoNQZmpUoIpawaGS1PNyqFpi0fo7Fzw1OgdrR0xCdZCLMiUy7PYVp5GTTmwqrhJ5nZ4RwNrVqsDNz_9sDNUQ=',
  'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGUw9Ime2ZWS3fPa0GfdwmrifTDTdXN_03ke8v_c343FoRXoaISz5n6smGj0kooSHxdQqKTjQgcRO0500yWW79h9BoMW1DV3j6rjL3QwyWwnnmvGlgCZq06ej4m_F7JhEeISTi9rtrcp8pi8pUYq3-qNv5a8VFjIFWpLJRrg2EUbT4ZHf4x9uINYqEUf_B7xZwz6iGQl-d9pmFNz1ZMJoiGKQxwdGsdVi7WjadEHS8wB4GT3UCDx_s=',
  'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHIRN_CPexwFoWIwNp40p1PH9_zzwhxlhjFTWH9ZLWjexpkI-zDrIFvO0ALaPbm2gWXCKrS5CjcS35geTl2mcYm8-4vJhjwB6BlL5YGfa_McZ3KdCue59Gun6deQBaM4Ht1hkylfEiGrCOkesauhYUff62DR0gXhxnItC-Ig6fN2bUy0X4A249ejDXdaK4aAB-kALhM3VTPyEISxiyZiQp1ae0leI1WLwUrbQs2eqcmbfwQGDyl'
];

targets.forEach((t, i) => {
  https.get(t, res => {
    console.log('[' + (i + 1) + '] Status: ' + res.statusCode + ' -> ' + res.headers.location);
  });
});
