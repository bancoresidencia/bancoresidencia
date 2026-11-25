async function testUsp() {
  const url = "https://question-hub-bff.sanar.com.br/lunar/questions";
  const token = "jMI0WGzXmML33e7cIm9D5JEf-JrTdXcH_QL4odQrgRk";
  const payload = {
    institution: { id: "438e2592-cecd-4b9c-8c66-701f0464b120" },
    limit: 20,
    skip: 0,
    order: "DESC",
    filters: {}
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("USP-SP Total questions in Sanar:", data.pagination.total);
  for (const q of data.data) {
    console.log(`- [${q.year}] ${q.statement.substring(0, 80).replace(/<[^>]+>/g, '')}`);
    const imgs = q.statement.match(/src=["'](https?:\/\/[^"']+)["']/gi) || [];
    if (imgs.length) console.log('   Images:', imgs);
  }
}
testUsp();
