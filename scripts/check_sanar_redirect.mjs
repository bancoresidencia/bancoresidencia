async function resolveUrl() {
  const redirectUrl = 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQG1IRUwBICU0PRYzde347R3iySSzYqNg2ellNNTmrcZvPlpXwHaIHvhbNY1t7wmqEhmFCkXxPiljCUu9Ckypn1iqZBGEvYwSmoCPX6BJHJZy7Wcu6kSrt1RMlwBq8zMzoHW_VVpRksMaoF1GrLd0FqxRWyNn7YngZqg4wJ01s3_4xrncTP26Kol2KAb8q_h8X77ysl3mW_slw==';
  
  const res = await fetch(redirectUrl, { redirect: 'manual' });
  const location = res.headers.get('location');
  console.log('Redirect Location:', location);
  
  if (location) {
    const pageRes = await fetch(location, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await pageRes.text();
    console.log('HTML size:', html.length);
    
    // Look for image tags
    const imgMatches = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi) || [];
    console.log('Image tags found:', imgMatches.length);
    imgMatches.forEach(tag => console.log('  Img:', tag));
  }
}

resolveUrl().catch(console.error);
