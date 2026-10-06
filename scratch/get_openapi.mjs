import fs from 'fs';

const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZWRwZG1ndmdhdGpkZnhneGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNzk3MTgsImV4cCI6MjA0Nzg1NTcxOH0.cjoaggOXt1kY9WmVNbAipCOQ2dP4PWLP43KMf8cO8Wo';

async function getOpenAPI() {
  const res = await fetch('https://bxedpdmgvgatjdfxgxij.supabase.co/rest/v1/', {
    headers: {
      'apikey': apikey,
      'Authorization': `Bearer ${apikey}`
    }
  });
  console.log('Status:', res.status);
  const json = await res.json();
  const paths = Object.keys(json.paths || {});
  console.log('Total paths in OpenAPI:', paths.length);
  
  // Find question RPCs
  const rpcs = paths.filter(p => p.includes('rpc/'));
  console.log('RPCs:', rpcs.filter(r => r.includes('question') || r.includes('filter') || r.includes('theme') || r.includes('specialt')));

  // Look for parameters of get_filtered_questions_secure_v4 or similar
  const filteredRpc = paths.find(p => p.includes('filtered_questions'));
  if (filteredRpc) {
    console.log('\nDetails for', filteredRpc, ':');
    console.log(JSON.stringify(json.paths[filteredRpc], null, 2));
  }

  // Look for theme tables or rpcs
  const themesRelated = paths.filter(p => p.includes('theme') || p.includes('specialt') || p.includes('taxonom'));
  console.log('\nThemes/Taxonomy paths:', themesRelated);

  fs.writeFileSync('d:/bancoresidencia/scratch/medevo_openapi_paths.json', JSON.stringify(paths, null, 2));
}

getOpenAPI();
