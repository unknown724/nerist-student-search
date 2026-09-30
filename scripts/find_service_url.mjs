async function findServiceUrl() {
  const configUrls = [
    'https://nerist.symphonyx.in/student/assets/config.json',
    'https://nerist.symphonyx.in/student/assets/app-config.json',
    'https://nerist.symphonyx.in/student/assets/env.json',
    'https://nerist.symphonyx.in/assets/config.json'
  ];

  for (const url of configUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        console.log(`✅ [CONFIG FOUND] ${url}: ${text}`);
      }
    } catch (e) {}
  }
}

findServiceUrl();
