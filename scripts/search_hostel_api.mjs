async function searchHostelApi() {
  const chunks = ['chunk-B7P3FAKX.js', 'chunk-5YEBQAKP.js'];

  for (const c of chunks) {
    const url = `https://nerist.symphonyx.in/student/${c}`;
    try {
      console.log(`📥 Searching ${c}...`);
      const res = await fetch(url);
      const text = await res.text();

      const regex = /.{0,60}(?:Hostel Name|Hostel Wing|Room Number|hostelName|hostelWing|roomNumber|Hostel Block).{0,60}/gi;
      const matches = new Set();
      let m;
      while ((m = regex.exec(text)) !== null) {
        matches.add(m[0].trim());
      }

      console.log(`   Found ${matches.size} matches in ${c}:`);
      Array.from(matches).slice(0, 15).forEach(item => console.log('   ->', item));
    } catch (e) {
      console.log(`   Error: ${e.message}`);
    }
  }
}

searchHostelApi();
