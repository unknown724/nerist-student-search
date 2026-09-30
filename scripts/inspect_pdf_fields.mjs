import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function inspectPdf(regNo) {
  const formatted = regNo.replace(/\//g, '_');
  const sessions = ['2026_1', '2025_2', '2025_1', '2024_2', '2024_1'];

  for (const session of sessions) {
    const url = `https://saascdn.symphonyx.in/fetch/9/1/3/AcknowledgmentSlips/${formatted}_${session}.pdf`;
    try {
      const res = await fetch(url);
      if (res.ok && (res.headers.get('content-type') || '').includes('pdf')) {
        const buffer = await res.arrayBuffer();
        console.log(`\n==================================================`);
        console.log(`📄 RAW TEXT ROWS FOR: ${regNo} (Session: ${session})`);
        console.log(`==================================================`);

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

        textRows.forEach((row, i) => {
          console.log(`[Row ${String(i+1).padStart(2, '0')}] ${row}`);
        });
        return;
      }
    } catch (e) {}
  }
  console.log(`❌ No PDF found for ${regNo}`);
}

async function run() {
  await inspectPdf('120/011');
  await inspectPdf('126/005');
  await inspectPdf('125/001');
}

run();
