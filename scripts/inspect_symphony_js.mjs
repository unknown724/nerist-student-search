async function inspectJs() {
  try {
    const res = await fetch('https://nerist.symphonyx.in/student/');
    const html = await res.text();
    console.log('📄 HTML Content fetched. Searching for script tags...\n');

    const scriptMatches = html.match(/src="([^"]+)"/g) || [];
    console.log('Script files found:', scriptMatches);

    for (const match of scriptMatches) {
      const src = match.replace('src="', '').replace('"', '');
      const fullUrl = src.startsWith('http') ? src : `https://nerist.symphonyx.in/student/${src.replace(/^\//, '')}`;
      console.log(`\n📥 Fetching JS bundle: ${fullUrl}...`);
      
      const jsRes = await fetch(fullUrl);
      const jsText = await jsRes.text();
      console.log(`   Length: ${jsText.length} bytes`);

      // Search for keywords in JS
      const keywords = ['hostel', 'roomNumber', 'room', 'profile', 'api/', 'fetch/'];
      keywords.forEach(kw => {
        const regex = new RegExp(`.{0,50}${kw}.{0,50}`, 'gi');
        const matches = jsText.match(regex) || [];
        if (matches.length > 0) {
          console.log(`   🎯 Keyword "${kw}" found ${matches.length} times. Sample matches:`);
          matches.slice(0, 3).forEach(m => console.log(`      -> ${m.trim()}`));
        }
      });
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}

inspectJs();
