async function scanIadhed() {
  for (let id = 1; id <= 60; id++) {
    const url = `https://portal.iadhedconcursos.org/edital/ver/${id}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) continue;
      const html = await res.text();
      const m = html.match(/<u[^>]*>([\s\S]*?)<\/u>[\s\S]*?<br>([\s\S]*?)<\/p>/i);
      if (m) {
        const edital = m[1].replace(/<[^>]+>/g, '').trim();
        const inst = m[2].replace(/<[^>]+>/g, '').trim();
        console.log(`[IADHED ${id}] ${edital} - ${inst}`);
      }
    } catch(e) {}
  }
}
scanIadhed();
