async function testApi() {
  const url = "https://question-hub-bff.sanar.com.br/lunar/questions";
  const token = "jMI0WGzXmML33e7cIm9D5JEf-JrTdXcH_QL4odQrgRk";
  
  const payload = {
    order: "DESC",
    limit: 5,
    skip: 0,
    filters: {}
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Response keys:", Object.keys(data));
  console.log("Total found / pagination:", data.pagination);
  if (data.data && data.data.length > 0) {
    console.log("First question sample:", {
      id: data.data[0].id,
      institution: data.data[0].institution,
      year: data.data[0].year,
      statement: data.data[0].statement ? data.data[0].statement.substring(0, 100) : 'no stmt',
      images: data.data[0].images
    });
  }
}
testApi();
