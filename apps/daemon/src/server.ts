import { initDB, getDB } from './db.js';
import { detectAgents } from './agents.js';
import { projectRoutes } from './routes/projects.js';
import { chatRoutes } from './routes/chat.js';
import { exportRoutes } from './routes/export.js';

export function createServer(port: number) {
  initDB();

  return Bun.serve({
    port,
    hostname: '127.0.0.1',

    async fetch(req): Promise<Response> {
      const url = new URL(req.url);
      const path = url.pathname;

      // CORS — daemon is local-only, but agent UIs may call from localhost
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };
      if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      // Attach CORS to all responses
      const wrap = (r: Response) => {
        for (const [k, v] of Object.entries(corsHeaders)) {
          r.headers.set(k, v);
        }
        return r;
      };

      // Health
      if (path === '/api/health' && req.method === 'GET') {
        const agents = detectAgents();
        return wrap(Response.json({ ok: true, agents: agents.filter(a => a.installed).map(a => a.name) }));
      }

      // Agents list
      if (path === '/api/agents' && req.method === 'GET') {
        return wrap(Response.json(detectAgents()));
      }

      // Project routes
      if (path.startsWith('/api/projects')) {
        return wrap(await projectRoutes(req, url));
      }

      // Chat routes
      if (path.startsWith('/api/chat')) {
        return wrap(await chatRoutes(req, url));
      }

      // Export / measure routes
      if (path.startsWith('/api/export') || path.startsWith('/api/measure')) {
        return wrap(await exportRoutes(req, url));
      }

      return wrap(Response.json({ error: 'not found' }, { status: 404 }));
    },

    error(err) {
      console.error('[dash-daemon] error:', err);
      return new Response(JSON.stringify({ error: 'internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });
}
