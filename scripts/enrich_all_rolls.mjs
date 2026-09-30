import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const studentsPath = join(__dirname, '..', 'src', 'data', 'students.json');
const cachePath = join(__dirname, '..', 'src', 'data', 'rolls_cache.json');

const students = JSON.parse(readFileSync(studentsPath, 'utf-8'));
let cache = {};
if (existsSync(cachePath)) {
  try {
    cache = JSON.parse(readFileSync(cachePath, 'utf-8'));
    console.log(`Loaded ${Object.keys(cache).length} cached roll records.`);
  } catch (e) {}
}

const sessions = [
  '2026_1', '2025_2', '2025_1', '2024_2', '2024_1',
  '2023_2', '2023_1', '2022_2', '2022_1', '2020_2', '2020_1'
];

let pdfjsLib = null;
async function getPdfJs() {
  if (!pdfjsLib) {
    const pdfjsModule = await import('pdfjs-dist/legacy/build/pdf.js');
    pdfjsLib = pdfjsModule.default || pdfjsModule;
    pdfjsLib.GlobalWorkerOptions.workerSrc = join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.js');
  }
  return pdfjsLib;
}

async function extractRollFromPdfBuffer(buffer) {
  try {
    const lib = await getPdfJs();
    const loadingTask = lib.getDocument({ data: new Uint8Array(buffer), verbosity: 0 });
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

    for (const row of textRows) {
      if (row.includes('Roll No')) {
        const match = row.match(/Roll No\s*[:\-]\s*([A-Za-z0-9\/]+)/i);
        if (match) {
          return match[1].trim();
        }
      }
    }
  } catch (err) {
    // Ignore parse errors
  }
  return null;
}

async function fetchRollForStudent(regNo) {
  if (cache[regNo] !== undefined) {
    return cache[regNo];
  }

  const formatted = regNo.replace(/\//g, '_');
  for (const session of sessions) {
    const url = `https://saascdn.symphonyx.in/fetch/9/1/3/AcknowledgmentSlips/${formatted}_${session}.pdf`;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
      clearTimeout(timeout);
      
      if (res.ok) {
        const buf = await res.arrayBuffer();
        if (buf.byteLength > 1000) {
          const roll = await extractRollFromPdfBuffer(buf);
          if (roll) {
            cache[regNo] = roll;
            return roll;
          }
        }
      }
    } catch (e) {}
  }
  cache[regNo] = null;
  return null;
}

function saveCache() {
  writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf-8');
}

function updateStudentsJson() {
  let enrichedCount = 0;
  for (const s of students) {
    if (cache[s.user_id]) {
      s.roll_no = cache[s.user_id];
      enrichedCount++;
    } else if (s.roll_no === undefined) {
      s.roll_no = null;
    }
  }
  writeFileSync(studentsPath, JSON.stringify(students, null, 2), 'utf-8');
  return enrichedCount;
}

async function run() {
  console.log(`Starting roll enrichment for ${students.length} students...`);
  const startTime = Date.now();
  const CONCURRENCY = 30;

  // Filter students that need fetching
  const pending = students.filter(s => cache[s.user_id] === undefined);
  console.log(`Pending students to query: ${pending.length} (Already cached: ${Object.keys(cache).length})`);

  let processed = 0;
  let found = Object.values(cache).filter(Boolean).length;

  for (let i = 0; i < pending.length; i += CONCURRENCY) {
    const chunk = pending.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async (s) => {
      const roll = await fetchRollForStudent(s.user_id);
      if (roll) found++;
    }));

    processed += chunk.length;

    if (processed % 150 === 0 || i + CONCURRENCY >= pending.length) {
      saveCache();
      const enriched = updateStudentsJson();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`Progress: ${processed}/${pending.length} checked (${found} rolls found). Total in JSON: ${enriched}. Elapsed: ${elapsed}s`);
    }
  }

  saveCache();
  const totalEnriched = updateStudentsJson();
  console.log(`\n🎉 Completed! Successfully populated ${totalEnriched} roll numbers in students.json!`);
}

run().catch(console.error);
