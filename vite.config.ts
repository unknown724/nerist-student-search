import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-mock-middleware',
      configureServer(server) {
        const localTelemetryLogs: any[] = [];
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/')) {
            const url = new URL(req.url, 'http://localhost');
            const pathName = url.pathname;
            
            if (pathName === '/api/searches/' || pathName === '/api/searches') {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ count: 14320 }));
              return;
            }
            if (pathName === '/api/searches/up') {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ count: 14321 }));
              return;
            }
            if (pathName === '/api/helped/' || pathName === '/api/helped') {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ count: 1840 }));
              return;
            }
            if (pathName === '/api/helped/up') {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ count: 1841 }));
              return;
            }
            if (pathName === '/api/pdfProxy') {
              const regNo = url.searchParams.get('regNo') || '';
              const formattedRegNo = regNo.replace(/\//g, '_');
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
              
              const fetchPromises = sessions.map(async (session) => {
                const pdfUrl = `https://saascdn.symphonyx.in/fetch/9/1/3/AcknowledgmentSlips/${formattedRegNo}_${session}.pdf`;
                const response = await fetch(pdfUrl, {
                  headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                if (response.ok) {
                  const contentType = response.headers.get("content-type") || "";
                  const buffer = await response.arrayBuffer();
                  if (contentType.includes("pdf") || buffer.byteLength > 1000) {
                    return { session, buffer };
                  }
                }
                throw new Error(`Session ${session} not found`);
              });

              try {
                const result = await Promise.any(fetchPromises);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('X-Detected-Session', result.session);
                res.end(Buffer.from(result.buffer));
              } catch (e: any) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'PDF not found' }));
              }
              return;
            }

            if (pathName === '/api/dossierCache') {
              try {
                const liveUrl = `https://nerist-student-search.pages.dev${req.url}`;
                let reqBody: any = undefined;
                if (req.method === 'POST') {
                  const buffers: Uint8Array[] = [];
                  for await (const chunk of req) {
                    buffers.push(chunk);
                  }
                  reqBody = Buffer.concat(buffers).toString();
                }
                const response = await fetch(liveUrl, {
                  method: req.method,
                  headers: { 'Content-Type': 'application/json' },
                  body: reqBody
                });
                const data = await response.text();
                res.statusCode = response.status;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(data);
              } catch (e: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: e.message }));
              }
              return;
            }

            if (pathName === '/api/track') {
              if (req.method === 'GET') {
                const adminKey = url.searchParams.get('adminKey');
                if (adminKey !== 'devanandawaheng725@gmail.com' && adminKey !== 'nowyouseeme') {
                  res.statusCode = 401;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Unauthorized access' }));
                  return;
                }
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(JSON.stringify({ count: localTelemetryLogs.length, logs: localTelemetryLogs }));
                return;
              }

              if (req.method === 'POST') {
                const buffers: Uint8Array[] = [];
                for await (const chunk of req) {
                  buffers.push(chunk);
                }
                const bodyStr = Buffer.concat(buffers).toString();
                let body: any = {};
                try { body = JSON.parse(bodyStr); } catch (e) {}

                const entry = {
                  id: Math.random().toString(36).substring(2, 9),
                  timestamp: new Date().toISOString(),
                  event: body.event || 'pageview',
                  ip: req.socket.remoteAddress || '127.0.0.1',
                  city: 'Local Dev (Localhost)',
                  region: 'Development',
                  country: 'IN',
                  isp: 'Local Network',
                  userAgent: req.headers['user-agent'] || 'Unknown Device',
                  details: body.details || {}
                };

                localTelemetryLogs.unshift(entry);
                if (localTelemetryLogs.length > 200) localTelemetryLogs.length = 200;

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(JSON.stringify({ status: 'ok', id: entry.id }));
                return;
              }
            }
          }
          next();
        });
      }
    }
  ],
  build: {
    chunkSizeWarningLimit: 2000
  }
})
