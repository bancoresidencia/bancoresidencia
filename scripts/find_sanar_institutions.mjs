const res = await fetch('https://sanarmed.com/wp-content/plugins/sanar-questoes1.0.20/public/data/institutions.json');
const data = await res.json();
console.log('Keys:', Object.keys(data));
const insts = Array.isArray(data) ? data : (data.institutions || data.data || []);
console.log('Total institutions in Sanar:', insts.length);

const targets = ['CORAÇÃO', 'HCOR', 'HVC', 'HPEV', 'EVANGELICO', 'EVANGÉLICO', 'UFRN', 'UFT', 'AMRIGS', 'ONOFRE', 'SANTA MARCELINA', 'HAOC'];
for (const t of targets) {
  const matches = insts.filter(i => (i.name||'').toUpperCase().includes(t) || (i.initials||'').toUpperCase().includes(t));
  console.log(`Query: ${t} ->`, matches.map(m => ({ id: m.id, name: m.name, initials: m.initials })));
}
