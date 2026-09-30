import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const studentsPath = join(__dirname, '..', 'src', 'data', 'students.json');
const cachePath = join(__dirname, '..', 'src', 'data', 'alumni_cache.json');

const students = JSON.parse(readFileSync(studentsPath, 'utf-8'));
const existingMap = new Map(students.map(s => [s.user_id, s]));

let cache = {};
if (existsSync(cachePath)) {
  try {
    cache = JSON.parse(readFileSync(cachePath, 'utf-8'));
  } catch (e) {}
}

const sessions = [
  '2026_1', '2025_2', '2025_1', '2024_2', '2024_1',
  '2023_2', '2023_1', '2022_2', '2022_1', '2021_2', '2020_2', '2019_2', '2018_2'
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

const DEPT_MAP = {
  'CS': { id: 2, name: 'Computer Science and Engineering', degree: 'COMPUTER SCIENCE & ENGINEERING' },
  'CSE': { id: 2, name: 'Computer Science and Engineering', degree: 'COMPUTER SCIENCE & ENGINEERING' },
  'AI': { id: 2, name: 'Computer Science and Engineering', degree: 'COMPUTER SCIENCE & ENGINEERING' },
  'IT': { id: 2, name: 'Computer Science and Engineering', degree: 'COMPUTER SCIENCE & ENGINEERING' },
  'EE': { id: 4, name: 'Electrical Engineering', degree: 'ELECTRICAL ENGINEERING' },
  'PSE': { id: 4, name: 'Electrical Engineering', degree: 'ELECTRICAL ENGINEERING' },
  'EC': { id: 5, name: 'Electronics and Communication Engineering', degree: 'ELECTRONICS & COMMUNICATION ENGINEERING' },
  'ECE': { id: 5, name: 'Electronics and Communication Engineering', degree: 'ELECTRONICS & COMMUNICATION ENGINEERING' },
  'MVD': { id: 5, name: 'Electronics and Communication Engineering', degree: 'ELECTRONICS & COMMUNICATION ENGINEERING' },
  'VLSI': { id: 5, name: 'Electronics and Communication Engineering', degree: 'ELECTRONICS & COMMUNICATION ENGINEERING' },
  'ME': { id: 6, name: 'Mechanical Engineering', degree: 'MECHANICAL ENGINEERING' },
  'CIM': { id: 6, name: 'Mechanical Engineering', degree: 'MECHANICAL ENGINEERING' },
  'TFE': { id: 6, name: 'Mechanical Engineering', degree: 'MECHANICAL ENGINEERING' },
  'TSE': { id: 6, name: 'Mechanical Engineering', degree: 'MECHANICAL ENGINEERING' },
  'CE': { id: 3, name: 'Civil Engineering', degree: 'CIVIL ENGINEERING' },
  'GTE': { id: 3, name: 'Civil Engineering', degree: 'CIVIL ENGINEERING' },
  'ESE': { id: 3, name: 'Civil Engineering', degree: 'CIVIL ENGINEERING' },
  'AE': { id: 1, name: 'Agricultural Engineering', degree: 'AGRICULTURAL ENGINEERING' },
  'AGE': { id: 1, name: 'Agricultural Engineering', degree: 'AGRICULTURAL ENGINEERING' },
  'FMP': { id: 1, name: 'Agricultural Engineering', degree: 'AGRICULTURAL ENGINEERING' },
  'SWC': { id: 1, name: 'Agricultural Engineering', degree: 'AGRICULTURAL ENGINEERING' },
  'SWCE': { id: 1, name: 'Agricultural Engineering', degree: 'AGRICULTURAL ENGINEERING' },
  'FO': { id: 7, name: 'Forestry', degree: 'FORESTRY' },
  'FOR': { id: 7, name: 'Forestry', degree: 'FORESTRY' },
  'FR': { id: 7, name: 'Forestry', degree: 'FORESTRY' },
  'FE': { id: 7, name: 'Forestry', degree: 'FORESTRY' },
  'PH': { id: 8, name: 'Physics', degree: 'PHYSICS' },
  'CY': { id: 9, name: 'Chemistry', degree: 'CHEMISTRY' },
  'CH': { id: 9, name: 'Chemistry', degree: 'CHEMISTRY' },
  'MA': { id: 10, name: 'Mathematics', degree: 'MATHEMATICS' },
  'MB': { id: 11, name: 'Management Studies', degree: 'MANAGEMENT STUDIES' },
  'MBA': { id: 11, name: 'Management Studies', degree: 'MANAGEMENT STUDIES' },
  'MS': { id: 11, name: 'Management Studies', degree: 'MANAGEMENT STUDIES' },
  'HS': { id: 13, name: 'Humanities & Social Sciences', degree: 'HUMANITIES & SOCIAL SCIENCES' },
};

function resolveDeptFromRoll(rollNo) {
  if (!rollNo) return { id: 2, name: 'Computer Science and Engineering', degree: 'COMPUTER SCIENCE & ENGINEERING' };
  const parts = rollNo.toUpperCase().split('/');
  for (const part of parts) {
    if (DEPT_MAP[part]) return DEPT_MAP[part];
  }
  return { id: 2, name: 'Computer Science and Engineering', degree: 'COMPUTER SCIENCE & ENGINEERING' };
}

function resolveProgramFromRoll(rollNo, userId) {
  if (rollNo) {
    const upper = rollNo.toUpperCase();
    if (upper.startsWith('B/')) return 'Base Module (Certificate)';
    if (upper.startsWith('DS/')) return 'Diploma Module';
    if (upper.startsWith('D/')) return 'B.Tech. (Degree Module)';
    if (upper.startsWith('MT/')) return 'M.Tech.';
    if (upper.startsWith('MS/')) return 'M.Sc.';
    if (upper.startsWith('MBA/') || upper.startsWith('MB/')) return 'MBA';
    if (upper.startsWith('PHD/') || upper.startsWith('PH.D/')) return 'Ph.D.';
  }
  if (userId) {
    if (userId.startsWith('3')) return 'B.Tech. (Degree Module)';
    if (userId.startsWith('1')) return 'B.Tech. (Degree Module)';
    if (userId.startsWith('2')) return 'Diploma Module';
    if (userId.startsWith('5')) return 'Ph.D.';
  }
  return 'B.Tech. (Degree Module)';
}

async function parsePdfBuffer(buffer) {
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

    let fullName = null;
    let rollNo = null;
    let mobile = null;
    let email = null;
    let program = null;

    for (const row of textRows) {
      if (row.includes("Student Name:") && !fullName) {
        const match = row.match(/Student Name:\s*(.*?)(?:\s+DOB:|\s+Email:|$)/i);
        if (match) fullName = match[1].trim().replace(/\s+DOB$/i, '');
      }
      if (row.includes('Roll No') && !rollNo) {
        const match = row.match(/Roll No\s*[:\-]\s*([A-Za-z0-9\/]+)/i);
        if (match) rollNo = match[1].trim();
      }
      if (row.includes('Mobile:') && !row.includes('Parents Mobile') && !mobile) {
        const match = row.match(/Mobile:\s*([+0-9\s-]{10,16})/);
        if (match) mobile = match[1].trim().replace(/[-\s]/g, '');
      }
      if (row.includes('Email:') && !row.includes('EmailId') && !email) {
        const match = row.match(/Email:\s*([^\s]+@[^\s]+)/i);
        if (match) email = match[1].trim();
      }
      if (row.includes("SEMESTER COURSE REGISTRATION FORM FOR") && !program) {
        const match = row.match(/SEMESTER COURSE REGISTRATION FORM FOR\s+(.*?)(?:\s+Report|\s+$)/i);
        if (match) program = match[1].trim();
      }
    }

    return { fullName, rollNo, mobile, email, program };
  } catch (err) {
    return null;
  }
}

async function probeStudent(regNo) {
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
          const parsed = await parsePdfBuffer(buf);
          if (parsed && parsed.fullName) {
            cache[regNo] = { session, ...parsed };
            return cache[regNo];
          }
        }
      }
    } catch (e) {}
  }
  cache[regNo] = null;
  return null;
}

// 1. Gather all existing students missing mobile
const missingMobileStudents = students.filter(s => !s.mobile).map(s => s.user_id);

// 2. Additional past batches to crawl: 115, 116, 117, 215, 216, 217, 316, 317, 318, 420, 421, 520, 521, 522, 523
const additionalPastBatches = [
  { prefix: '115', max: 200 },
  { prefix: '116', max: 200 },
  { prefix: '117', max: 200 },
  { prefix: '215', max: 120 },
  { prefix: '216', max: 120 },
  { prefix: '217', max: 120 },
  { prefix: '316', max: 70 },
  { prefix: '317', max: 70 },
  { prefix: '318', max: 70 },
  { prefix: '420', max: 120 },
  { prefix: '421', max: 130 },
  { prefix: '520', max: 50 },
  { prefix: '521', max: 50 },
  { prefix: '522', max: 50 },
  { prefix: '523', max: 50 }
];

const pastCandidateRegNos = [];
for (const t of additionalPastBatches) {
  for (let i = 1; i <= t.max; i++) {
    const regNo = `${t.prefix}/${String(i).padStart(3, '0')}`;
    pastCandidateRegNos.push(regNo);
  }
}

// Combine both lists, de-duplicating
const allTargets = Array.from(new Set([...missingMobileStudents, ...pastCandidateRegNos]));
console.log(`Total targets to process: ${allTargets.length} (${missingMobileStudents.length} missing mobile, ${pastCandidateRegNos.length} past batch candidates).`);

async function run() {
  const startTime = Date.now();
  const CONCURRENCY = 40;
  let addedCount = 0;
  let updatedCount = 0;

  for (let i = 0; i < allTargets.length; i += CONCURRENCY) {
    const chunk = allTargets.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async (regNo) => {
      const data = await probeStudent(regNo);
      if (data && data.fullName) {
        if (existingMap.has(regNo)) {
          const existing = existingMap.get(regNo);
          let changed = false;
          if (!existing.mobile && data.mobile) {
            existing.mobile = data.mobile;
            changed = true;
          }
          if (!existing.email && data.email) {
            existing.email = data.email;
            changed = true;
          }
          if (!existing.roll_no && data.rollNo) {
            existing.roll_no = data.rollNo;
            changed = true;
          }
          if (changed) updatedCount++;
        } else {
          const dept = resolveDeptFromRoll(data.rollNo);
          const prog = resolveProgramFromRoll(data.rollNo, regNo);
          const newStudent = {
            user_id: regNo,
            full_name: data.fullName,
            semester: 8,
            program_name: prog,
            degree_name: dept.degree,
            department_id: dept.id,
            department_name: dept.name,
            cgpa: 'N/A',
            avatar_url: 'M9',
            last_updated: new Date().toISOString(),
            state: null,
            pincode: null,
            roll_no: data.rollNo || null,
            mobile: data.mobile || null,
            email: data.email || null,
            status: 'Alumni / Left'
          };
          students.push(newStudent);
          existingMap.set(regNo, newStudent);
          addedCount++;
          console.log(`[+] Added alumni: ${regNo} (${data.fullName}) - Roll: ${data.rollNo || 'N/A'} - Mobile: ${data.mobile || 'N/A'}`);
        }
      }
    }));

    if (i % 200 === 0 || i + CONCURRENCY >= allTargets.length) {
      writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf-8');
      writeFileSync(studentsPath, JSON.stringify(students, null, 2), 'utf-8');
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`Progress: ${Math.min(i + CONCURRENCY, allTargets.length)}/${allTargets.length} checked. Added: ${addedCount} past students. Updated: ${updatedCount} with mobile. Elapsed: ${elapsed}s`);
    }
  }

  writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf-8');
  writeFileSync(studentsPath, JSON.stringify(students, null, 2), 'utf-8');
  console.log(`\n🎉 Completed! Added: ${addedCount} past students. Updated: ${updatedCount} existing students with mobile/email. Total students: ${students.length}`);
}

run().catch(console.error);
