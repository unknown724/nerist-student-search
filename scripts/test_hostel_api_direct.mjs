async function testHostelApi(regNo) {
  const hosts = [
    'https://nerist.symphonyx.in',
    'https://saasapi.symphonyx.in'
  ];

  const params = [
    `instId=9&userId=${encodeURIComponent(regNo)}`,
    `instId=9&userId=${regNo.replace('/', '_')}`,
    `instituteId=9&userId=${encodeURIComponent(regNo)}`
  ];

  for (const host of hosts) {
    for (const p of params) {
      const url = `${host}/api/studentPortal/getHostelDetails?${p}`;
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Accept': 'application/json, text/plain, */*'
          }
        });
        const contentType = res.headers.get('content-type') || '';
        const text = await res.text();
        console.log(`URL: ${url}`);
        console.log(`  Status: ${res.status}, Type: ${contentType}`);
        console.log(`  Response: ${text.slice(0, 300)}\n`);
      } catch (e) {
        console.log(`Error ${url}: ${e.message}`);
      }
    }
  }
}

testHostelApi('121/006');
