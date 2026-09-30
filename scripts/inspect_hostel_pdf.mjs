async function testGet(url) {
  try {
    const res = await fetch(url);
    const contentType = res.headers.get('content-type') || '';
    const buf = await res.arrayBuffer();
    console.log(`URL: ${url}`);
    console.log(`  Status: ${res.status}, Type: ${contentType}, Size: ${buf.byteLength} bytes`);
    if (contentType.includes('pdf') || buf.byteLength > 1000) {
      // Dump text
      const pdfjsModule = await import('pdfjs-dist/legacy/build/pdf.js');
      const pdfjsLib = pdfjsModule.default || pdfjsModule;
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
      const page = await pdf.getPage(1);
      const textContent = await page.getTextContent();
      const text = textContent.items.map(i => i.str).join(' ');
      console.log(`  Extracted Text snippet: ${text.slice(0, 300)}...`);
    }
  } catch (e) {
    console.log(`  Error: ${e.message}`);
  }
}

async function run() {
  await testGet('https://saascdn.symphonyx.in/fetch/9/1/3/HostelAllotment/120_011.pdf');
  await testGet('https://saascdn.symphonyx.in/fetch/9/1/3/Hostel/120_011.pdf');
  await testGet('https://saascdn.symphonyx.in/fetch/9/1/3/FEE_SLIPS/120_011_2026_1.pdf');
}

run();
