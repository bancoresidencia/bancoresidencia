const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function fetchSchema() {
  const res = await fetch(`${url}/rest/v1/`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    }
  });

  const schema = await res.json();
  console.log('PostgREST schema definitions (tables & views):', Object.keys(schema.definitions || {}));
  
  // Find all RPC functions (paths starting with /rpc/)
  const rpcPaths = Object.keys(schema.paths || {}).filter(p => p.startsWith('/rpc/'));
  console.log('\nRPC functions available on Supabase:');
  console.log(rpcPaths);
}

fetchSchema();
