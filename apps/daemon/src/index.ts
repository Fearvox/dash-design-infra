import { createServer } from './server.js';

interface ServerHandle {
  stop(closeActiveConnections?: boolean): void;
  readonly port: number;
}

let server: ServerHandle | null = null;

export function start(port = 3845): ServerHandle {
  server = createServer(port) as unknown as ServerHandle;
  console.log(`[dash-daemon] listening on http://127.0.0.1:${server.port}`);
  return server;
}

export function stop() {
  if (server) {
    server.stop(true);
    console.log('[dash-daemon] stopped');
    server = null;
  }
}

if (import.meta.main) {
  start(parseInt(process.env.DASH_DAEMON_PORT ?? '3845', 10));
}
