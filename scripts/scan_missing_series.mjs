import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function formatRegNo(regNo) {
  return regNo.replace(/\//g, '_');
}

function parseBranchInfo(text) {
  const textUpper = text.toUpperCase();
  let program_name = "B.Tech.";
  let degree_name = "COMPUTER SCIENCE & ENGINEERING";
  let department_id = 2;
  let department_name = "Computer Science and Engineering";

  if (textUpper.includes("AGRICULTUR")) {
    department_id = 1;
    department_name = "Agricultural Engineering";
    degree_name = "AGRICULTURAL ENGINEERING";
  } else if (textUpper.includes("CIVIL")) {
    department_id = 3;
    department_name = "Civil Engineering";
    degree_name = "CIVIL ENGINEERING";
  } else if (textUpper.includes("COMPUTER") || textUpper.includes("CSE")) {
    department_id = 2;
    department_name = "Computer Science and Engineering";
    degree_name = "COMPUTER SCIENCE & ENGINEERING";
  } else if (textUpper.includes("ELECTRICAL")) {
    department_id = 4;
    department_name = "Electrical Engineering";
    degree_name = "ELECTRICAL ENGINEERING";
  } else if (textUpper.includes("ELECTRONIC") || textUpper.includes("ECE")) {
    department_id = 5;
    department_name = "Electronics and Communication Engineering";
    degree_name = "ELECTRONICS & COMMUNICATION ENGINEERING";
  } else if (textUpper.includes("MECHANICAL")) {
    department_id = 6;
    department_name = "Mechanical Engineering";
    degree_name = "MECHANICAL ENGINEERING";
  } else if (textUpper.includes("FORESTRY")) {
    department_id = 7;
    department_name = "Forestry";
    degree_name = "FORESTRY";
    program_name = "B.Sc.";
  } else if (textUpper.includes("PHYSICS")) {
    department_id = 8;
    department_name = "Physics";
    degree_name = "PHYSICS";
  } else if (textUpper.includes("CHEMISTRY")) {
    department_id = 9;
    department_name = "Chemistry";
    degree_name = "CHEMISTRY";
  } else if (textUpper.includes("MATHEMATIC")) {
    department_id = 10;
    department_name = "Mathematics";
    degree_name = "MATHEMATICS";
  } else if (textUpper.includes("MANAGEMENT") || textUpper.includes("MBA")) {
    department_id = 11;
    department_name = "Management Studies";
    degree_name = "MANAGEMENT STUDIES";
    program_name = "MBA";
  }

  if (textUpper.includes("DIPLOMA")) {
    program_name = "Diploma";
  } else if (textUpper.includes("CERTIFICATE") || textUpper.includes("MODULE")) {
    program_name = "Certificate";
  } else if (textUpper.includes("M.TECH") || textUpper.includes("MASTER OF TECH")) {
    program_name = "M.Tech.";
  } else if (textUpper.includes("M.SC") || textUpper.includes("MASTER OF SCIENCE")) {
    program_name = "M.Sc.";
  } else if (textUpper.includes("PH.D") || textUpper.includes("DOCTOR")) {
    program_name = "Ph.D.";
  }

  return { program_name, degree_name, department_id, department_name };
}

async function downloadStudentPdf(regNo) {
  const sessions = ['2026_2', '2026_1', '2025_2', '2025_1'];
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

async function parsePdf(buffer) {
  const pdfjsModule = await import('pdfjs-dist/legacy/build/pdf.js');
  const pdfjsLib = pdfjsModule.default || pdfjsModule;
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

  let studentName = null;
  let branchText = "";
  const dossier = {
    dob: null, fatherName: null, motherName: null,
    phone: null, email: null, address: null,
    parentsMobile: null, aadhaar: null
  };

  textRows.forEach((row) => {
    if (row.includes("Name:") && !row.includes("Father") && !row.includes("Mother") && !studentName) {
      const match = row.match(/(?:Student\s+)?Name:\s*(.*?)(?:\s+DOB:|DOB:|Mobile:|Email:|$)/i);
      if (match) studentName = match[1].trim().replace(/\s+DOB$/i, '');
    }
    if (row.includes("Branch:") || row.includes("Course:") || row.includes("Program:")) {
      branchText += " " + row;
    }
    if (row.includes('DOB:')) {
      const match = row.match(/DOB:\s*([^\s]+)/i);
      if (match) dossier.dob = match[1].trim();
    }
    if (row.includes("Father's Name:")) {
      const match = row.match(/Father's Name:\s*(.*?)(?:Mother's Name:|Mobile:|Email:|Parents Mobile:|$|Aadhaar|Address)/i);
      if (match) dossier.fatherName = match[1].trim().replace(/\s\s+/g, ' ');
    }
    if (row.includes("Mother's Name:")) {
      const match = row.match(/Mother's Name:\s*(.*?)(?:Father's Name:|Mobile:|Email:|Parents Mobile:|$|Aadhaar|Address)/i);
      if (match) dossier.motherName = match[1].trim().replace(/\s\s+/g, ' ');
    }
    if (row.includes('Email:') && !row.includes('EmailId')) {
      const match = row.match(/Email:\s*([^\s]+@[^\s]+)/i);
      if (match) dossier.email = match[1].trim();
    }
    if (row.includes('Mobile:') && !row.includes('Parents Mobile')) {
      const match = row.match(/(?<!Parents\s+)Mobile:\s*([+0-9\s-]{10,16})/i);
      if (match) {
        dossier.phone = match[1].trim().replace(/[-\s]/g, '');
      } else {
        const simpleMatch = row.match(/Mobile:\s*([+0-9\s-]{10,16})/);
        if (simpleMatch) dossier.phone = simpleMatch[1].trim().replace(/[-\s]/g, '');
      }
    }
    if (row.includes('Address:')) {
      const match = row.match(/Address:\s*(.*)$/i);
      if (match) dossier.address = match[1].trim().replace(/\s\s+/g, ' ');
    }
    if (row.includes('Parents Mobile')) {
      const match = row.match(/Parents Mobile\s*[:\-]?\s*([+0-9\s-]{10,16})/i);
      if (match) dossier.parentsMobile = match[1].trim().replace(/[-\s]/g, '');
    }
    if (row.includes('Aadhaar')) {
      const match = row.match(/Aadhaar(?:\s*No\s*)?\s*:\s*([0-9\s-]{12,16})/i);
      if (match) dossier.aadhaar = match[1].trim().replace(/[-\s]/g, '');
    }
  });

  return { studentName, branchText, dossier, fullTextRows: textRows };
}

async function scanTargetRanges() {
  const targets = [
    { prefix: '126', start: 21, end: 200, label: '2026 Degree (126)' },
    { prefix: '226', start: 1, end: 150, label: '2026 Diploma (226)' },
    { prefix: '426', start: 1, end: 200, label: '2026 PG / M.Tech / M.Sc (426)' },
    { prefix: '526', start: 1, end: 80, label: '2026 Ph.D (526)' }
  ];

  const studentsPath = join(__dirname, '..', 'src', 'data', 'students.json');
  let existingStudents = [];
  try {
    existingStudents = JSON.parse(readFileSync(studentsPath, 'utf8'));
  } catch (e) {}

  const existingMap = new Map(existingStudents.map(s => [s.user_id, s]));
  let totalAdded = 0;

  for (const target of targets) {
    console.log(`\n==================================================`);
    console.log(`🔎 Target: ${target.label} (Prefix ${target.prefix}/ range ${target.start} to ${target.end})`);
    console.log(`==================================================`);

    let consecutiveFailures = 0;

    for (let n = target.start; n <= target.end; n++) {
      const padded = String(n).padStart(3, '0');
      const regNo = `${target.prefix}/${padded}`;

      if (existingMap.has(regNo)) {
        continue;
      }

      let pdfRes;
      try {
        pdfRes = await downloadStudentPdf(regNo);
      } catch (e) {
        pdfRes = null;
      }

      if (!pdfRes) {
        consecutiveFailures++;
        // If 20 consecutive IDs return 404, we've likely reached the end of this batch range
        if (consecutiveFailures >= 20) {
          console.log(`🛑 20 consecutive empty responses for ${target.prefix}/ series. Moving to next target.`);
          break;
        }
        await delay(300);
        continue;
      }

      consecutiveFailures = 0; // reset on hit

      try {
        const parsed = await parsePdf(pdfRes.buffer);
        const name = parsed.studentName || `STUDENT ${regNo}`;
        const branchInfo = parseBranchInfo(parsed.branchText || parsed.fullTextRows.join(" "));

        const newStudentObj = {
          user_id: regNo,
          full_name: name.toUpperCase(),
          semester: 1,
          program_name: branchInfo.program_name,
          degree_name: branchInfo.degree_name,
          department_id: branchInfo.department_id,
          department_name: branchInfo.department_name,
          cgpa: "N/A",
          avatar_url: `M${n % 10}`,
          last_updated: new Date().toISOString(),
          state: null,
          pincode: null
        };

        existingStudents.push(newStudentObj);
        existingMap.set(regNo, newStudentObj);
        totalAdded++;

        console.log(`   ✨ DISCOVERED [${target.prefix}]: ${regNo} -> ${newStudentObj.full_name} (${newStudentObj.department_name})`);

        // Cache dossier to Cloudflare KV
        const hasData = parsed.dossier.dob || parsed.dossier.fatherName || parsed.dossier.phone || parsed.dossier.email;
        if (hasData) {
          try {
            await fetch('https://nerist-student-search.pages.dev/api/dossierCache', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ regNo, dossier: parsed.dossier })
            });
          } catch (e) {}
        }
      } catch (err) {
        console.log(`   ⚠️ Error parsing ${regNo}:`, err.message);
      }

      await delay(500);
    }

    // Save progress after each target series
    writeFileSync(studentsPath, JSON.stringify(existingStudents, null, 2), 'utf8');
  }

  console.log(`\n🎉 SCAN COMPLETE! Total new students discovered & added across missing series: ${totalAdded}`);
}

scanTargetRanges();
