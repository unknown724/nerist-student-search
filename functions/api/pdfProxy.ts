export async function onRequest(context: any) {
  const url = new URL(context.request.url);
  const regNo = url.searchParams.get("regNo");
  if (!regNo) {
    return new Response(JSON.stringify({ error: "Missing regNo parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const formattedRegNo = regNo.replace(/\//g, "_");
  
  // Search sessions in parallel to find the latest valid acknowledgment slip
  const sessions = [
    '2026_2', '2026_1',
    '2025_2', '2025_1',
    '2024_2', '2024_1',
    '2023_2', '2023_1',
    '2022_2', '2022_1',
    '2021_2', '2021_1',
    '2020_2', '2020_1',
    '2019_2', '2019_1',
    '2018_2'
  ];

  const FETCH_TIMEOUT_MS = 8000; // 8-second timeout per individual fetch

  const fetchPromises = sessions.map(async (session) => {
    const pdfUrl = `https://saascdn.symphonyx.in/fetch/9/1/3/AcknowledgmentSlips/${formattedRegNo}_${session}.pdf`;
    
    // AbortController for per-request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(pdfUrl, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        const buffer = await response.arrayBuffer();
        // Ensure it is a valid PDF (not an HTML error page returned as 200)
        if (contentType.includes("pdf") || buffer.byteLength > 1000) {
          return { session, buffer };
        }
      }
      throw new Error(`Session ${session} not found or invalid`);
    } catch (err: any) {
      clearTimeout(timeoutId);
      // Re-tag abort errors so we can distinguish CDN-down from PDF-not-found
      if (err.name === 'AbortError') {
        throw new Error(`TIMEOUT:Session ${session} timed out after ${FETCH_TIMEOUT_MS}ms`);
      }
      // Network-level failures (DNS, connection refused, etc.)
      if (err.cause || err.message?.includes('fetch failed') || err.message?.includes('network')) {
        throw new Error(`NETWORK:Session ${session} network error: ${err.message}`);
      }
      throw err;
    }
  });

  try {
    // Promise.any returns the first successfully resolved promise
    const result = await Promise.any(fetchPromises);
    
    return new Response(result.buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Access-Control-Allow-Origin": "*",
        "X-Detected-Session": result.session
      }
    });
  } catch (err: any) {
    // Inspect all rejection reasons to decide between 404 vs 502
    const reasons: string[] = (err.errors || []).map((e: any) => e.message || '');
    const hasTimeout = reasons.some((r: string) => r.startsWith('TIMEOUT:'));
    const hasNetwork = reasons.some((r: string) => r.startsWith('NETWORK:'));

    if (hasTimeout || hasNetwork) {
      // CDN is unreachable or too slow — tell the client it's a server-side issue, not "not found"
      return new Response(JSON.stringify({ 
        error: `SymphonyX CDN is currently unreachable or too slow. Please try again later.`,
        code: 'CDN_UNREACHABLE'
      }), {
        status: 502,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // All sessions returned valid HTTP responses but none had the PDF → genuine 404
    return new Response(JSON.stringify({ 
      error: `Acknowledgment slip not found for registration ID: ${regNo}`,
      code: 'NOT_FOUND'
    }), {
      status: 404,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
