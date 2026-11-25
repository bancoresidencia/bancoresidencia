async function fetchInstitutions() {
  const res = await fetch('https://sanarmed.com/wp-content/plugins/sanar-questoes1.0.20/public/data/institutions.json');
  const data = await res.json();
  console.log('Type of data:', typeof data, Array.isArray(data));
  console.log('Keys:', Object.keys(data).slice(0, 10));
  if (!Array.isArray(data)) {
    const k = Object.keys(data)[0];
    console.log('First key:', k, 'Sample val:', data[k]);
  }
}
fetchInstitutions();
