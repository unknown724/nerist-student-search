// Cloudflare Pages Function: /api/dossierCache
// GET ?regNo=... → returns cached parsed dossier JSON from KV (or 404)
// POST { regNo, dossier } → stores parsed dossier JSON in KV

interface Env {
  DOSSIER_CACHE: KVNamespace;
}

function kvKey(regNo: string): string {
  return `dossier:${regNo.replace(/\//g, '_')}`;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  // CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Validate KV binding exists
  if (!env.DOSSIER_CACHE) {
    return new Response(JSON.stringify({ error: 'KV binding not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // ─── GET: Retrieve cached dossier ───
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const regNo = url.searchParams.get('regNo');
    
    if (!regNo) {
      return new Response(JSON.stringify({ error: 'Missing regNo parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    try {
      const cached = await env.DOSSIER_CACHE.get(kvKey(regNo), 'json');
      
      if (cached) {
        return new Response(JSON.stringify({ 
          source: 'cache', 
          dossier: cached 
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      return new Response(JSON.stringify({ error: 'Not cached' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || 'KV read failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }

  // ─── POST: Store parsed dossier ───
  if (request.method === 'POST') {
    try {
      const body = await request.json() as { regNo?: string; dossier?: any };
      
      if (!body.regNo || !body.dossier) {
        return new Response(JSON.stringify({ error: 'Missing regNo or dossier in request body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Validate the dossier has at least some data
      const d = body.dossier;
      const hasData = d.dob || d.fatherName || d.motherName || d.phone || d.email || d.aadhaar;
      if (!hasData) {
        return new Response(JSON.stringify({ error: 'Dossier contains no meaningful data, not caching' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Store in KV (no expiration — data is permanent)
      await env.DOSSIER_CACHE.put(kvKey(body.regNo), JSON.stringify(body.dossier));

      return new Response(JSON.stringify({ success: true, key: kvKey(body.regNo) }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || 'KV write failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
