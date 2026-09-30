// Cloudflare Pages Function: /api/track
// POST: Logs user login, search, or decryption activity with IP, city, region, ISP, and device
// GET: Admin viewer for recent logs (protected by adminKey=nowyouseeme)

interface Env {
  DOSSIER_CACHE?: KVNamespace;
  DISCORD_WEBHOOK_URL?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // GET: Fetch recent tracking logs (requires adminKey)
  if (request.method === 'GET') {
    const adminKey = url.searchParams.get('adminKey');
    if (adminKey !== 'devanandawaheng725@gmail.com' && adminKey !== 'nowyouseeme') {
      return new Response(JSON.stringify({ error: 'Unauthorized access' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    try {
      const kv = env.DOSSIER_CACHE;
      if (!kv) {
        return new Response(JSON.stringify({ count: 0, logs: [], message: 'KV not attached' }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const raw = await kv.get('portal:telemetry:recent_logs', 'json');
      const logs = (raw as any[]) || [];
      return new Response(JSON.stringify({ count: logs.length, logs }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }

  // POST: Record user telemetry
  if (request.method === 'POST') {
    try {
      const body = (await request.json().catch(() => ({}))) as any;
      const cf = (request as any).cf || {};
      const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || 'Unknown IP';
      const userAgent = request.headers.get('user-agent') || 'Unknown Device';

      const entry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        event: body.event || 'pageview',
        ip: ip,
        city: cf.city || 'Local / Unknown',
        region: cf.region || '',
        country: cf.country || 'IN',
        isp: cf.asOrganization || 'Unknown ISP',
        userAgent: userAgent,
        details: body.details || {}
      };

      // Store in KV recent logs buffer (max 300 entries)
      const kv = env.DOSSIER_CACHE;
      if (kv) {
        try {
          const existing = ((await kv.get('portal:telemetry:recent_logs', 'json')) as any[]) || [];
          existing.unshift(entry);
          if (existing.length > 300) existing.length = 300;
          await kv.put('portal:telemetry:recent_logs', JSON.stringify(existing));
        } catch (e) {}
      }

      // Optional: push to Discord webhook if configured in environment
      if (env.DISCORD_WEBHOOK_URL) {
        try {
          await fetch(env.DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: `🛡️ **[NERIST Portal] ${entry.event.toUpperCase()}**\n📍 **Location**: ${entry.city}, ${entry.region} (${entry.country}) | **ISP**: ${entry.isp}\n🌐 **IP**: \`${entry.ip}\`\n📱 **Device**: \`${entry.userAgent.substring(0, 100)}\`\n📋 **Details**: \`${JSON.stringify(entry.details)}\``
            })
          });
        } catch (e) {}
      }

      return new Response(JSON.stringify({ status: 'ok', id: entry.id }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders });
}
