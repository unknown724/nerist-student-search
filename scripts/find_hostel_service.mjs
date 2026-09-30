async function findHostelService() {
  const url = 'https://nerist.symphonyx.in/student/chunk-B7P3FAKX.js';
  try {
    const res = await fetch(url);
    const jsText = await res.text();

    const regex = /.{0,100}hostelData.{0,100}/gi;
    const matches = new Set();
    let m;
    while ((m = regex.exec(jsText)) !== null) {
      matches.add(m[0].trim());
    }

    console.log(`Found ${matches.size} hostelData code blocks:`);
    Array.from(matches).forEach(item => console.log(' ->', item));
  } catch (e) {
    console.log('Error:', e.message);
  }
}

findHostelService();
