async function testEndpoint(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    if (res.status === 200 && text.length > 20 && !text.startsWith('<!DOC')) {
      console.log(`✅ [FOUND 200] ${url}`);
      console.log(`   Type: ${contentType}, Length: ${text.length}`);
      console.log(`   Snippet: ${text.slice(0, 300)}\n`);
    } else {
      // console.log(`❌ [${res.status}] ${url}`);
    }
  } catch (e) {}
}

async function run() {
  const regNos = ['120_011', '126_005', '326_079', '124_044'];
  const testPaths = [
    'StudentProfile', 'Profile', 'StudentDetails', 'Hostel', 'HostelDetails',
    'HostelAllotment', 'Hostel_Allotment', 'HostelSlip', 'HostelReceipt',
    'Dossier', 'StudentData', 'STUDENT_DATA', 'STUDENT_DOSSIER', 'STUDENT_HOSTEL'
  ];
  const exts = ['.json', '.pdf', '.jpg', '.png'];

  for (const reg of regNos) {
    for (const path of testPaths) {
      for (const ext of exts) {
        await testEndpoint(`https://saascdn.symphonyx.in/fetch/9/1/3/${path}/${reg}${ext}`);
      }
    }
  }
}

run();
