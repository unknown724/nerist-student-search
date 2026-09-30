/**
 * Bulk Pre-Scraper: Downloads all student PDFs from SymphonyX CDN,
 * parses them client-side, and uploads the extracted JSON to Cloudflare KV.
 * 
 * Usage:
 *   node scripts/prescrape.mjs
 * 
 * Prerequisites:
 *   - npm install pdfjs-dist (already in project dependencies)
 *   - Must be logged into wrangler: npx wrangler login
 *   - DOSSIER_CACHE KV namespace must exist
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Config ───
const KV_NAMESPACE_ID = 'f938a2cd998b4e3f8276135bd39f55ff';
const ACCOUNT_ID = '524423b5a94d67e7bdb78b8bf735dae3';
const CONCURRENCY = 15; // Parallel fetch limit
const SESSIONS = ['2025_2', '2025_1', '2024_2', '2024_1', '2023_2', '2023_1', '2022_2', '2022_1', '2020_2', '2020_1'];

// ─── Load students ───
const studentsPath = join(__dirname, '..', 'src', 'data', 'students.json');
const students = JSON.parse(readFileSync(studentsPath, 'utf-8'));
console.log(`📋 Loaded ${students.length} students`);

// ─── PDF parsing (lightweight text extraction) ───
async function parsePdfBuffer(buffer) {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js');
  pdfjsLib.GlobalWorkerOptions.workerSrc = join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.js');
  
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const textContent = await page.getTextContent();
  
  const items = textContent.items;
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
      const rowText = currentLineItems.map(cli => cli.str).join('  ').trim();
      if (rowText) textRows.push(rowText);
      currentY = y;
      currentLineItems = [item];
    }
  }
  
  if (currentLineItems.length > 0) {
    currentLineItems.sort((a, b) => a.transform[4] - b.transform[4]);
    const rowText = currentLineItems.map(cli => cli.str).join('  ').trim();
    if (rowText) textRows.push(rowText);
  }

  const result = {
    dob: null, fatherName: null, motherName: null,
    phone: null, email: null, address: null,
    parentsMobile: null, aadhaar: null
  };

  textRows.forEach(row => {
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
      const match = row.match(/Mobile:\s*([+0-9\s-]{10,16})/);
      if (match) result.phone = match[1].trim().replace(/[-\s]/g, '');
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

// ─── Fetch PDF for a student across all sessions ───
async function fetchStudentPdf(regNo) {
  const formattedRegNo = regNo.replace(/\//g, '_');
  
  const fetchPromises = SESSIONS.map(async (session) => {
    const pdfUrl = `https://saascdn.symphonyx.in/fetch/9/1/3/AcknowledgmentSlips/${formattedRegNo}_${session}.pdf`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(pdfUrl, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength > 1000) {
          return { session, buffer };
        }
      }
      throw new Error('not found');
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  });

  return Promise.any(fetchPromises);
}

// ─── Upload to KV via Wrangler REST API ───
async function uploadToKV(regNo, dossier) {
  const key = `dossier:${regNo.replace(/\//g, '_')}`;
  const { execSync } = await import('child_process');
  
  // Write to temp file to avoid shell escaping issues
  const tempFile = join(__dirname, '..', '.tmp_kv_value.json');
  const { writeFileSync, unlinkSync } = await import('fs');
  writeFileSync(tempFile, JSON.stringify(dossier));
  
  try {
    execSync(
      `npx wrangler kv key put "${key}" --path="${tempFile}" --namespace-id=${KV_NAMESPACE_ID}`,
      { cwd: join(__dirname, '..'), stdio: 'pipe', timeout: 15000 }
    );
    return true;
  } catch (err) {
    console.error(`  ❌ KV upload failed for ${regNo}: ${err.message}`);
    return false;
  } finally {
    try { unlinkSync(tempFile); } catch { /* ignore */ }
  }
}

// ─── Main batch processor ───
async function processBatch(batch, batchIndex, totalBatches) {
  const results = await Promise.allSettled(
    batch.map(async (student) => {
      const regNo = student.user_id;
      try {
        const { buffer } = await fetchStudentPdf(regNo);
        const dossier = await parsePdfBuffer(buffer);
        
        const hasData = dossier.dob || dossier.fatherName || dossier.motherName || 
                        dossier.phone || dossier.email || dossier.aadhaar;
        
        if (!hasData) {
          return { regNo, status: 'empty', cached: false };
        }
        
        const cached = await uploadToKV(regNo, dossier);
        return { regNo, status: 'success', cached };
      } catch {
        return { regNo, status: 'not_found', cached: false };
      }
    })
  );

  let success = 0, notFound = 0, empty = 0, failed = 0;
  results.forEach(r => {
    if (r.status === 'fulfilled') {
      const v = r.value;
      if (v.status === 'success' && v.cached) success++;
      else if (v.status === 'not_found') notFound++;
      else if (v.status === 'empty') empty++;
      else failed++;
    } else {
      failed++;
    }
  });

  console.log(`  Batch ${batchIndex + 1}/${totalBatches}: ✅ ${success} cached, 🔍 ${notFound} not found, ⚪ ${empty} empty, ❌ ${failed} failed`);
  return { success, notFound, empty, failed };
}

// ─── Entry point ───
async function main() {
  console.log('\n🚀 NERIST Student Dossier Pre-Scraper');
  console.log('═'.repeat(50));
  console.log(`Students: ${students.length}`);
  console.log(`Sessions to scan: ${SESSIONS.join(', ')}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log('═'.repeat(50));
  
  const batches = [];
  for (let i = 0; i < students.length; i += CONCURRENCY) {
    batches.push(students.slice(i, i + CONCURRENCY));
  }
  
  let totalSuccess = 0, totalNotFound = 0, totalEmpty = 0, totalFailed = 0;
  const startTime = Date.now();
  
  for (let i = 0; i < batches.length; i++) {
    const { success, notFound, empty, failed } = await processBatch(batches[i], i, batches.length);
    totalSuccess += success;
    totalNotFound += notFound;
    totalEmpty += empty;
    totalFailed += failed;
    
    // Rate limit: short delay between batches
    if (i < batches.length - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('\n' + '═'.repeat(50));
  console.log('📊 FINAL RESULTS');
  console.log('═'.repeat(50));
  console.log(`✅ Cached:     ${totalSuccess}`);
  console.log(`🔍 Not found:  ${totalNotFound}`);
  console.log(`⚪ Empty PDF:  ${totalEmpty}`);
  console.log(`❌ Failed:     ${totalFailed}`);
  console.log(`⏱️  Time:       ${elapsed}s`);
  console.log(`📦 Cache rate:  ${((totalSuccess / students.length) * 100).toFixed(1)}%`);
  console.log('═'.repeat(50));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
