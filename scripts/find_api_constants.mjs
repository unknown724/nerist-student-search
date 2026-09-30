async function findApiConstants() {
  const url = 'https://nerist.symphonyx.in/student/chunk-B7P3FAKX.js';
  try {
    const res = await fetch(url);
    const jsText = await res.text();

    let idx = jsText.indexOf('GET_HOSTEL_DETAILS');
    while (idx !== -1) {
      console.log('🎯 Found GET_HOSTEL_DETAILS at index:', idx);
      console.log('Code context:\n');
      console.log(jsText.slice(Math.max(0, idx - 100), idx + 250));
      console.log('--------------------------------------------------\n');
      idx = jsText.indexOf('GET_HOSTEL_DETAILS', idx + 1);
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}

findApiConstants();
