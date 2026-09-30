// Use native fetch in Node 24

async function testPost() {
  const url = 'https://nerist-student-search.pages.dev/api/dossierCache';
  const payload = {
    regNo: '999/999',
    dossier: {
      dob: '01/01/2000',
      fatherName: 'Test Father',
      motherName: 'Test Mother',
      phone: '9999999999',
      email: 'test@example.com',
      address: 'Test Address',
      parentsMobile: '8888888888',
      aadhaar: '123412341234'
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const text = await res.text();
    console.log('Response Status:', res.status);
    console.log('Response Body:', text);
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

testPost();
