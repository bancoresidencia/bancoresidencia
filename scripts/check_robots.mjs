async function test() {
  const res = await fetch("https://oslermedicina.com.br/robots.txt", { headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log('robots.txt status:', res.status);
  if (res.ok) {
    const text = await res.text();
    console.log(text);
  }
}
test();
