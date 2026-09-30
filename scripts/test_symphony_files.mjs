async function testUrl(url) {
  try {
    const res = await fetch(url);
    const contentType = res.headers.get('content-type') || '';
    const buf = await res.arrayBuffer();
    if (res.status === 200 && buf.byteLength > 500 && !contentType.includes('text/html')) {
      console.log(`✅ [FOUND] ${url}`);
      console.log(`   Type: ${contentType}, Size: ${buf.byteLength} bytes`);
    }
  } catch (e) {}
}

async function run() {
  const fileNames = [
    'Hostel.pdf', 'HostelAllotment.pdf', 'Hostel_Allotment.pdf', 'HostelList.pdf',
    'Hostel_List.pdf', 'HostelRoom.pdf', 'Hostel_Room.pdf', 'HostelAllocated.pdf',
    'Hostel_2026.pdf', 'Hostel_2025.pdf', 'Hostel_Allotment_2026.pdf', 'Hostel_Allotment_2025.pdf',
    'Hostel_Allotment_Jul_2026.pdf', 'Hostel_Allotment_Jan_2026.pdf'
  ];

  const folders = [
    'Hostel', 'HostelAllotment', 'Hostel_Allotment', 'HostelSlips', 'HostelReceipts',
    'Challan', 'Challans', 'Fees', 'FeeReceipts', 'Admission', 'Documents'
  ];

  console.log(`🔎 Testing SymphonyX static files & folders...\n`);

  for (const fn of fileNames) {
    await testUrl(`https://saascdn.symphonyx.in/fetch/9/1/3/${fn}`);
  }

  for (const folder of folders) {
    await testUrl(`https://saascdn.symphonyx.in/fetch/9/1/3/${folder}/120_011.pdf`);
    await testUrl(`https://saascdn.symphonyx.in/fetch/9/1/3/${folder}/126_005.pdf`);
    await testUrl(`https://saascdn.symphonyx.in/fetch/9/1/3/${folder}/125_001.pdf`);
  }
}

run();
