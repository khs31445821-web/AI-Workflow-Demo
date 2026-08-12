import fs from 'node:fs';
import path from 'node:path';

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

export function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body)
  });
  res.end(body);
}

export function sendError(res, error) {
  sendJson(res, error.statusCode || 500, {
    ok: false,
    error: error.message || 'Internal error'
  });
}

export async function readJson(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 1_000_000) throw Object.assign(new Error('Payload too large'), { statusCode: 413 });
  }
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    throw Object.assign(new Error('Invalid JSON'), { statusCode: 400 });
  }
}

export function bearer(req) {
  const value = req.headers.authorization || '';
  return value.startsWith('Bearer ') ? value.slice(7) : '';
}

export function serveStatic(res, publicDir, pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const resolved = path.resolve(publicDir, `.${requested}`);
  if (!resolved.startsWith(path.resolve(publicDir))) return false;
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) return false;
  const ext = path.extname(resolved);
  res.writeHead(200, {
    'content-type': mime[ext] || 'application/octet-stream',
    'cache-control': ext === '.html' ? 'no-store' : 'public, max-age=300'
  });
  fs.createReadStream(resolved).pipe(res);
  return true;
}
