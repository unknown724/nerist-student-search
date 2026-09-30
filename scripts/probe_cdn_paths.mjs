import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function probePaths(regNo) {
  const formatted = regNo.replace(/\//g, '_');
  
  const testUrls = [
    `https://saascdn.symphonyx.in/fetch/9/1/3/HostelAllotment/${formatted}.pdf`,
    `https://saascdn.symphonyx.in/fetch/9/1/3/Hostel/${formatted}.pdf`,
    `https://saascdn.symphonyx.in/fetch/9/1/3/HOSTEL_SLIPS/${formatted}.pdf`,
    `https://saascdn.symphonyx.in/fetch/9/1/3/HOSTEL_IMAGES/${formatted}.jpg`,
    `https://saascdn.symphonyx.in/fetch/9/1/3/ID_CARDS/${formatted}.pdf`,
    `https://saascdn.symphonyx.in/fetch/9/1/3/GradeCards/${formatted}_2025_2.pdf`,
    `https://saascdn.symphonyx.in/fetch/9/1/3/GradeSheet/${formatted}.pdf`,
    `https://saascdn.symphonyx.in/fetch/9/1/3/RESULT/${formatted}_2025_2.pdf`,
    `https://saascdn.symphonyx.in/fetch/9/1/3/FEES_RECEIPTS/${formatted}.pdf`,
    `https://saascdn.symphonyx.in/fetch/9/1/3/FEE_SLIPS/${formatted}_2026_1.pdf`
  ];

  console.log(`🔎 Probing CDN paths for ${regNo} (${formatted})...\n`);

  for (const url of testUrls) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      console.log(`[Status ${res.status}] ${url}`);
    } catch (e) {
      console.log(`[ERR] ${url}: ${e.message}`);
    }
  }
}

probePaths('120/011');
