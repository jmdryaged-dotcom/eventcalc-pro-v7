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

  return context.next();
}
