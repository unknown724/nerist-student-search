import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

  let rollNo = null;
  textRows.forEach(row => {
    if (row.includes('Roll No')) {
      const match = row.match(/Roll No\s*[:\-]\s*([A-Za-z0-9\/]+)/i);
      if (match) rollNo = match[1].trim();
    }
  });
  return rollNo;
}

async function checkSample() {
  const sampleIds = ['120/011', '126/005', '125/001', '122/010', '121/005', '224/001', '325/001'];
  const sessions = ['2026_1', '2025_2', '2025_1', '2024_2'];
  for (const id of sampleIds) {
    const formatted = id.replace(/\//g, '_');
    let found = false;
    for (const session of sessions) {
      const url = `https://saascdn.symphonyx.in/fetch/9/1/3/AcknowledgmentSlips/${formatted}_${session}.pdf`;
      try {
        const res = await fetch(url);
        if (res.ok) {
          const buf = await res.arrayBuffer();
          const roll = await parsePdf(buf);
          console.log(`✅ ${id} -> Roll No: ${roll} (from ${session})`);
          found = true;
          break;
        }
      } catch (e) {}
    }
    if (!found) console.log(`❌ ${id} -> PDF not found`);
  }
}
checkSample();
