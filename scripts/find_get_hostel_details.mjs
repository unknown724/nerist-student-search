async function findGetHostelDetails() {
  const url = 'https://nerist.symphonyx.in/student/chunk-B7P3FAKX.js';
  try {
    const res = await fetch(url);
    const jsText = await res.text();

    let idx = jsText.indexOf('getHostelDetails(');
    while (idx !== -1) {
      console.log('🎯 Found getHostelDetails at index:', idx);
      console.log('Code context:\n');
      console.log(jsText.slice(Math.max(0, idx - 150), idx + 350));
      console.log('--------------------------------------------------\n');
      idx = jsText.indexOf('getHostelDetails(', idx + 1);
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}

findGetHostelDetails();
