const TOKEN = "jMI0WGzXmML33e7cIm9D5JEf-JrTdXcH_QL4odQrgRk";

async function checkSampleSanarIds() {
  const ids = [
    'b45ec426-20ee-406d-9bac-bb1c14097e66',
    '438bd3bb-9f03-4ebb-9bc4-3936033b10cc',
    'f0bfeb18-ee39-426c-9e4e-bf25bb1255a4'
  ];

  for (const id of ids) {
    try {
      const res = await fetch(`https://question-hub-bff.sanar.com.br/lunar/questions/${id}`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      console.log(`Fetch ${id} status:`, res.status);
      if (res.ok) {
        const data = await res.json();
        console.log(`Data for ${id}:`, {
          statement: data.statement?.slice(0, 100),
          images: data.images,
          has_images: data.has_images,
          files: data.files
        });
      }
    } catch (e) {
      console.error(id, e.message);
    }
  }
}

checkSampleSanarIds();
