import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Format registration ID for URL path (e.g. 120/011 -> 120_011)
function formatRegNo(regNo) {
  return regNo.replace(/\//g, '_');
}

// Fetch all remote KV keys via Wrangler to optimize lookups
function getRemoteKeys() {
  try {
    console.log('📡 Fetching remote KV keys list to optimize cache checks...');
    const stdout = execSync('npx wrangler kv key list --binding=DOSSIER_CACHE --remote', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const keys = JSON.parse(stdout);
    console.log(`✅ Loaded ${keys.length} cached keys from Cloudflare KV.`);
    return new Set(keys.map(k => k.name));
  } catch (err) {
    console.log('⚠️  Failed to fetch remote keys via Wrangler. Will fall back to on-demand endpoint checks.');
    return null;
  }
}

// PDF Parser function matching App.tsx logic
async function parsePdfBuffer(buffer) {
  // Dynamically import pdfjs-dist legacy package
  const pdfjsModule = await import('pdfjs-dist/legacy/build/pdf.js');
  const pdfjsLib = pdfjsModule.default || pdfjsModule;
  pdfjsLib.GlobalWorkerOptions.workerSrc = join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.js');

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const textContent = await page.getTextContent();

  const items = textContent.items;
  // Sort items by Y coordinate descending (top to bottom)
  items.sort((a, b) => b.transform[5] - a.transform[5]);

  const textRows = [];
  let currentY = -9999;
  let currentLineItems = [];

  for (const item of items) {
    const y = item.transform[5];
    if (currentY === -9999) {
      currentY = y;
      currentLineItems.push(item);
    } else if (Math.abs(currentY - y) <= 4) {
      currentLineItems.push(item);
    } else {
      currentLineItems.sort((a, b) => a.transform[4] - b.transform[4]);
      const rowText = currentLineItems.map((cli) => cli.str).join('  ').trim();
      if (rowText) textRows.push(rowText);
      currentY = y;
      currentLineItems = [item];
    }
  }

  if (currentLineItems.length > 0) {
    currentLineItems.sort((a, b) => a.transform[4] - b.transform[4]);
    const rowText = currentLineItems.map((cli) => cli.str).join('  ').trim();
    if (rowText) textRows.push(rowText);
  }

  const result = {
    dob: null,
    fatherName: null,
    motherName: null,
    phone: null,
    email: null,
    address: null,
    parentsMobile: null,
    aadhaar: null
  };

  textRows.forEach((row) => {
    if (row.includes('DOB:')) {
      const match = row.match(/DOB:\s*([^\s]+)/i);
      if (match) result.dob = match[1].trim();
    }
    if (row.includes("Father's Name:")) {
      const match = row.match(/Father's Name:\s*(.*?)(?:Mother's Name:|Mobile:|Email:|Parents Mobile:|$|Aadhaar|Address)/i);
      if (match) result.fatherName = match[1].trim().replace(/\s\s+/g, ' ');
    }
    if (row.includes("Mother's Name:")) {
      const match = row.match(/Mother's Name:\s*(.*?)(?:Father's Name:|Mobile:|Email:|Parents Mobile:|$|Aadhaar|Address)/i);
      if (match) result.motherName = match[1].trim().replace(/\s\s+/g, ' ');
    }
    if (row.includes('Email:') && !row.includes('EmailId')) {
      const match = row.match(/Email:\s*([^\s]+@[^\s]+)/i);
      if (match) result.email = match[1].trim();
    }
    if (row.includes('Mobile:') && !row.includes('Parents Mobile')) {
      const match = row.match(/(?<!Parents\s+)Mobile:\s*([+0-9\s-]{10,16})/i);
      if (match) {
        result.phone = match[1].trim().replace(/[-\s]/g, '');
      } else {
        const simpleMatch = row.match(/Mobile:\s*([+0-9\s-]{10,16})/);
        if (simpleMatch) result.phone = simpleMatch[1].trim().replace(/[-\s]/g, '');
      }
    }
    if (row.includes('Address:')) {
      const match = row.match(/Address:\s*(.*)$/i);
      if (match) result.address = match[1].trim().replace(/\s\s+/g, ' ');
    }
    if (row.includes('Parents Mobile')) {
      const match = row.match(/Parents Mobile\s*[:\-]?\s*([+0-9\s-]{10,16})/i);
      if (match) result.parentsMobile = match[1].trim().replace(/[-\s]/g, '');
    }
    if (row.includes('Aadhaar')) {
      const match = row.match(/Aadhaar(?:\s*No\s*)?\s*:\s*([0-9\s-]{12,16})/i);
      if (match) result.aadhaar = match[1].trim().replace(/[-\s]/g, '');
    }
  });

  return result;
}

// Download PDF from CDN sessions in parallel
async function downloadStudentPdf(regNo) {
  const sessions = [
    '2026_2', '2026_1',
    '2025_2', '2025_1',
    '2024_2', '2024_1',
    '2023_2', '2023_1',
    '2022_2', '2022_1',
    '2020_2', '2020_1'
  ];
  const formatted = formatRegNo(regNo);
  const FETCH_TIMEOUT_MS = 6000;

  const promises = sessions.map(async (session) => {
    const url = `https://saascdn.symphonyx.in/fetch/9/1/3/AcknowledgmentSlips/${formatted}_${session}.pdf`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        const buf = await res.arrayBuffer();
        if (contentType.includes('pdf') || buf.byteLength > 1000) {
          return { session, buffer: buf };
        }
      }
      throw new Error('Not found');
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
  });

  return Promise.any(promises);
}

// Main execution block
async function run() {
  const args = process.argv.slice(2);
  const startIndex = parseInt(args[0], 10) || 0;
  const limit = parseInt(args[1], 10) || 50; // default chunk size to prevent overwhelming

  console.log('----------------------------------------------------');
  console.log(`🚀 Starting Cache Populator (Index ${startIndex} to ${startIndex + limit})`);
  console.log('----------------------------------------------------');

  const studentsPath = join(__dirname, '..', 'src', 'data', 'students.json');
  let students = [];
  try {
    students = JSON.parse(readFileSync(studentsPath, 'utf8'));
  } catch (err) {
    console.error('❌ Failed to read students.json:', err.message);
    process.exit(1);
  }

  const remoteKeys = getRemoteKeys();

  const chunk = students.slice(startIndex, startIndex + limit);
  console.log(`📂 Loaded ${students.length} students. Processing ${chunk.length} items...`);

  let countSkipped = 0;
  let countFetched = 0;
  let countNotFound = 0;
  let countFailed = 0;

  for (let i = 0; i < chunk.length; i++) {
    const student = chunk[i];
    const { user_id, full_name } = student;
    const globalIdx = startIndex + i;

    console.log(`[${globalIdx + 1}/${students.length}] 🔍 Checking ${user_id} (${full_name})...`);

    // 1. Check if already cached in production Cloudflare KV (in-memory optimized)
    const cacheKey = `dossier:${formatRegNo(user_id)}`;
    let isCached = false;
    
    if (remoteKeys) {
      isCached = remoteKeys.has(cacheKey);
    } else {
      const checkUrl = `https://nerist-student-search.pages.dev/api/dossierCache?regNo=${encodeURIComponent(user_id)}`;
      try {
        const res = await fetch(checkUrl);
        if (res.status === 200) {
          isCached = true;
        }
      } catch (err) {
        console.log(`⚠️  Failed to check cache status for ${user_id}:`, err.message);
      }
    }

    if (isCached) {
      console.log(`   ⏭️  [SKIP] Already cached.`);
      countSkipped++;
      continue;
    }

    // 2. Fetch PDF from SymphonyX
    let pdfResult;
    try {
      pdfResult = await downloadStudentPdf(user_id);
    } catch (err) {
      // Promise.any throws AggregateError if all failed
      pdfResult = null;
    }

    if (!pdfResult) {
      console.log(`   ❌ [NOT FOUND] PDF not found in any sessions. Storing placeholder.`);
      countNotFound++;

      // Store a negative cache placeholder so we don't fetch it again on next runs
      try {
        await fetch('https://nerist-student-search.pages.dev/api/dossierCache', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            regNo: user_id,
            dossier: { dob: 'N/A', fatherName: 'N/A', motherName: 'N/A', phone: 'N/A', email: 'N/A' } // placeholder
          })
        });
      } catch (err) {
        console.log(`      ⚠️  Failed to write negative cache placeholder:`, err.message);
      }
      
      // Gentle throttle delay
      await delay(800);
      continue;
    }

    // 3. Parse PDF Text & extract dossier
    let dossier;
    try {
      dossier = await parsePdfBuffer(pdfResult.buffer);
    } catch (err) {
      console.log(`   💥 [PARSE ERROR] Failed to parse PDF:`, err.message);
      countFailed++;
      await delay(800);
      continue;
    }

    // Check if dossier contains valid data
    const hasData = dossier.dob || dossier.fatherName || dossier.motherName || dossier.phone || dossier.email || dossier.aadhaar;
    if (!hasData) {
      console.log(`   ⚠️  [EMPTY] Dossier parsed but contained no data.`);
      countFailed++;
      await delay(800);
      continue;
    }

    // 4. Save to remote KV
    try {
      const res = await fetch('https://nerist-student-search.pages.dev/api/dossierCache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regNo: user_id,
          dossier
        })
      });

      if (res.ok) {
        console.log(`   ✅ [SAVED] Dossier cached from session ${pdfResult.session}.`);
        countFetched++;
      } else {
        const text = await res.text();
        console.log(`   ❌ [WRITE ERROR] KV write failed (Status ${res.status}):`, text);
        countFailed++;
      }
    } catch (err) {
      console.log(`   ❌ [POST ERROR] Failed to send POST request:`, err.message);
      countFailed++;
    }

    // Throttling: wait 800ms between requests to prevent CDN rate limits
    await delay(800);
  }

  console.log('----------------------------------------------------');
  console.log('📊 Execution Summary:');
  console.log(`   - Total Checked: ${chunk.length}`);
  console.log(`   - Skipped (Already Cached): ${countSkipped}`);
  console.log(`   - Fetched & Saved: ${countFetched}`);
  console.log(`   - Not Found (Negative Cached): ${countNotFound}`);
  console.log(`   - Failures: ${countFailed}`);
  console.log('----------------------------------------------------');
}

run();
