import { writeFileSync } from 'fs';

async function searchMainJs() {
  try {
    const url = 'https://nerist.symphonyx.in/student/main-N3GF45XW.js';
    console.log('📥 Fetching main JS bundle...');
    const res = await fetch(url);
    const jsText = await res.text();
    console.log(`Loaded ${jsText.length} bytes.\n`);

    // Search for API endpoints
    const apiRegex = /["'](https?:\/\/[^"']+|\/api\/[^"']+)["']/gi;
    const urls = new Set();
    let m;
    while ((m = apiRegex.exec(jsText)) !== null) {
      if (m[1].includes('api') || m[1].includes('fetch') || m[1].includes('hostel') || m[1].includes('student')) {
        urls.add(m[1]);
      }
    }

    console.log('🔗 API & Resource Endpoints found in main JS:');
    Array.from(urls).slice(0, 30).forEach(u => console.log('  ->', u));

    // Search for Hostel field occurrences
    const hostelRegex = /.{0,60}hostel.{0,60}/gi;
    const hostelMatches = new Set();
    while ((m = hostelRegex.exec(jsText)) !== null) {
      hostelMatches.add(m[0].trim());
    }

    console.log(`\n🏠 Hostel references found (${hostelMatches.size} unique):`);
    Array.from(hostelMatches).slice(0, 20).forEach(h => console.log('  ->', h));

  } catch (e) {
    console.log('Error:', e.message);
  }
}

searchMainJs();
