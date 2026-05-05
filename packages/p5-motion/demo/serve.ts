const PORT = 3099;

const html = await Bun.file('./demo/index.html').text();
const data = await Bun.file('./demo/flowfield-data.json').text();

const server = Bun.serve({
  port: PORT,
  routes: {
    '/': new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }),
    '/data': new Response(data, { headers: { 'Content-Type': 'application/json' } }),
  },
  fetch(_req) {
    return new Response('Not found', { status: 404 });
  },
});

console.log(`🚀 dashFlowField demo at http://localhost:${PORT}`);

export {};
