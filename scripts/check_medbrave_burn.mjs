async function checkMedbraveBurn() {
  const url = 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGJVscQ5dVDjluxBfu1BmWDkjvKgQ84BSPzqYR1JCAmD8xscoIWIoYZGQggwYN6OlEugEqSX8ah39B4nlUwopSgNvdVhmzyBW-1J2XxCoKxzHb5VqEaRtvD4EQfgf4eKe9-oOBfw-pc4FHcXN0jqPYYAiyhqNR3fuE8LAjNcR1nbRgRvmZhTz8t940JO58qxFt_rBS-';
  const res = await fetch(url, { redirect: 'manual' });
  const location = res.headers.get('location');
  console.log('Location:', location);

  if (location) {
    const pageRes = await fetch(location, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await pageRes.text();
    console.log('Page HTML length:', html.length);
    const imgMatches = html.match(/https?:\/\/[^"'\s]+\.(?:png|jpg|jpeg|webp)/gi) || [];
    console.log('Images found:', imgMatches);
  }
}

checkMedbraveBurn().catch(console.error);
