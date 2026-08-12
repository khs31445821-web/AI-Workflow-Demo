import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { store } from './data/demo-store.js';
import {
  authenticateCustomer,
  createManualOrder,
  findOrder,
  generateDraft,
  getPublicResult,
  listOrders,
  publishOrder,
  reviewOrder,
  submitIntake,
  verifyCustomer
} from './domain/order-service.js';
import { assert } from './domain/control-rules.js';
import { bearer, readJson, sendError, sendJson, serveStatic } from './http/utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const PORT = Number(process.env.PORT || 3000);
const ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || 'portfolio-demo';
const SESSION_TTL = Number(process.env.SESSION_TTL_MINUTES || 120);

function adminLogin(password) {
  assert(password === ADMIN_PASSWORD, '관리자 비밀번호가 올바르지 않습니다.', 401);
  const token = `adm_${crypto.randomBytes(18).toString('base64url')}`;
  store.adminSessions.set(token, Date.now() + SESSION_TTL * 60_000);
  return token;
}

function requireAdmin(req) {
  const token = bearer(req);
  const expiresAt = store.adminSessions.get(token);
  assert(expiresAt, '관리자 인증이 필요합니다.', 401);
  if (expiresAt < Date.now()) {
    store.adminSessions.delete(token);
    assert(false, '관리자 세션이 만료되었습니다.', 401);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    if (req.method === 'GET' && pathname === '/api/health') {
      return sendJson(res, 200, { ok: true, mode: 'clean-room-portfolio-demo' });
    }

    if (req.method === 'POST' && pathname === '/api/customer/verify') {
      const body = await readJson(req);
      return sendJson(res, 200, { ok: true, ...verifyCustomer(body, SESSION_TTL) });
    }

    if (req.method === 'GET' && pathname === '/api/customer/me') {
      const order = authenticateCustomer(bearer(req));
      return sendJson(res, 200, { ok: true, order });
    }

    if (req.method === 'POST' && pathname === '/api/customer/intake') {
      const order = authenticateCustomer(bearer(req));
      const body = await readJson(req);
      return sendJson(res, 200, { ok: true, order: submitIntake(order, body) });
    }

    if (req.method === 'POST' && pathname === '/api/customer/generate') {
      const order = authenticateCustomer(bearer(req));
      generateDraft(order);
      return sendJson(res, 200, { ok: true, message: 'Mock AI draft generated and queued for human review.' });
    }

    if (req.method === 'POST' && pathname === '/api/admin/login') {
      const body = await readJson(req);
      return sendJson(res, 200, { ok: true, token: adminLogin(body.password) });
    }

    if (req.method === 'GET' && pathname === '/api/admin/orders') {
      requireAdmin(req);
      return sendJson(res, 200, { ok: true, orders: listOrders() });
    }

    if (req.method === 'POST' && pathname === '/api/admin/orders') {
      requireAdmin(req);
      const body = await readJson(req);
      return sendJson(res, 201, { ok: true, order: createManualOrder(body) });
    }

    const reviewMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)\/review$/);
    if (req.method === 'POST' && reviewMatch) {
      requireAdmin(req);
      const body = await readJson(req);
      return sendJson(res, 200, { ok: true, order: reviewOrder(reviewMatch[1], body) });
    }

    const publishMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)\/publish$/);
    if (req.method === 'POST' && publishMatch) {
      requireAdmin(req);
      return sendJson(res, 200, { ok: true, ...publishOrder(publishMatch[1]) });
    }

    const orderMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)$/);
    if (req.method === 'GET' && orderMatch) {
      requireAdmin(req);
      return sendJson(res, 200, { ok: true, order: findOrder(orderMatch[1]) });
    }

    const resultMatch = pathname.match(/^\/api\/result\/([^/]+)$/);
    if (req.method === 'GET' && resultMatch) {
      return sendJson(res, 200, { ok: true, result: getPublicResult(resultMatch[1]) });
    }

    if (req.method === 'GET' && serveStatic(res, publicDir, pathname)) return;
    sendJson(res, 404, { ok: false, error: 'Not found' });
  } catch (error) {
    sendError(res, error);
  }
});

server.listen(PORT, () => {
  console.log(`Portfolio demo running at http://localhost:${PORT}`);
  console.log(`Admin demo password: ${ADMIN_PASSWORD}`);
});
