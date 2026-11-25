async function inspectFilters() {
  const url = "https://question-hub-bff.sanar.com.br/lunar/questions";
  const token = "jMI0WGzXmML33e7cIm9D5JEf-JrTdXcH_QL4odQrgRk";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ order: "DESC", limit: 1, skip: 0, filters: {} })
  });
  const data = await res.json();
  console.log("Filters available in response:", JSON.stringify(data.filters, null, 2));
}
inspectFilters();
