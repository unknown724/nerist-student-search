async function searchChunks() {
  const chunks = [
    'chunk-5JTZBAP3.js',
    'chunk-R3MF4ZPB.js',
    'chunk-AMP75P4F.js',
    'chunk-BV7NQ6RK.js',
    'chunk-5LPT3HLC.js',
    'chunk-B7P3FAKX.js',
    'chunk-5YEBQAKP.js'
  ];

  for (const c of chunks) {
    const url = `https://nerist.symphonyx.in/student/${c}`;
    try {
      console.log(`📥 Fetching ${c}...`);
      const res = await fetch(url);
      const text = await res.text();
      console.log(`   Size: ${text.length} bytes`);

      // Search for hostel or profile endpoints
      const matches = text.match(/.{0,50}(?:hostel|roomNumber|profile|student\/|api\/).{0,50}/gi) || [];
      if (matches.length > 0) {
        console.log(`   🎯 Found ${matches.length} matches in ${c}:`);
        matches.slice(0, 5).forEach(m => console.log(`      -> ${m.trim()}`));
      }
    } catch (e) {
      console.log(`   Error fetching ${c}: ${e.message}`);
    }
  }
}

searchChunks();
