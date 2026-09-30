async function findHostelApiUrl() {
  const url = 'https://nerist.symphonyx.in/student/chunk-B7P3FAKX.js';
  try {
    const res = await fetch(url);
    const jsText = await res.text();

    const idx = jsText.indexOf('this.hostelData = resp.data');
    if (idx !== -1) {
      console.log('🎯 Found hostelData assignment at index:', idx);
      console.log('Code context around assignment:\n');
      console.log(jsText.slice(Math.max(0, idx - 400), idx + 200));
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}

findHostelApiUrl();
