const BLOCKED = [
  '/gerenciador-licencas',
  '/gerenciador-codigos-pix',
  '/admin-setup',
  '/admin-leads',
];

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/\.html$/, '').toLowerCase();

  if (BLOCKED.includes(path)) {
    return new Response('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>404</title></head><body><h1>404 — Página não encontrada</h1></body></html>', {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  if (url.pathname === '/') {
    url.pathname = '/index_v7.html';
    const asset = await context.env.ASSETS.fetch(new Request(url, context.request));
    return new Response(asset.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, must-revalidate',
      },
    });
  }

  const response = await context.next();

  const newHeaders = new Headers(response.headers);
  const ct = newHeaders.get('Content-Type') || '';
  if (ct.includes('text/html')) {
    newHeaders.set('Cache-Control', 'no-cache, must-revalidate');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
