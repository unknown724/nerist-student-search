async function testPortal(url) {
  try {
    const res = await fetch(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/html, */*'
      } 
    });
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    console.log(`URL: ${url}`);
    console.log(`  Status: ${res.status}, Type: ${contentType}, Length: ${text.length}`);
    if (res.status === 200 && text.length > 50 && !text.includes('<!DOCTYPE html>')) {
      console.log(`  Extracted Snippet: ${text.slice(0, 400)}\n`);
    } else if (text.includes('Hostel') || text.includes('Pare')) {
      console.log(`  🎯 KEYWORD HOSTEL MATCH FOUND! Snippet: ${text.slice(0, 400)}\n`);
    }
  } catch (e) {
    console.log(`  Error: ${e.message}`);
  }
}

async function run() {
  const regNo = '121/006';
  const formatted = '121_006';

  const testUrls = [
    `https://nerist.symphonyx.in/student/profile/${formatted}`,
    `https://nerist.symphonyx.in/student/profile?id=${regNo}`,
    `https://nerist.symphonyx.in/api/student/profile?userId=${regNo}`,
    `https://nerist.symphonyx.in/api/v1/student/${formatted}`,
    `https://nerist.symphonyx.in/api/student/details/${formatted}`,
    `https://nerist.symphonyx.in/student/details/${formatted}`,
    `https://saasapi.symphonyx.in/api/student/${formatted}`,
    `https://saascdn.symphonyx.in/fetch/9/1/3/Hostel/${formatted}.json`,
    `https://saascdn.symphonyx.in/fetch/9/1/3/HostelDetails/${formatted}.json`
  ];

  for (const url of testUrls) {
    await testPortal(url);
  }
}

run();
