import crypto from 'node:crypto';
import { store } from '../data/demo-store.js';
import { generateMockContent } from '../ai/mock-generator.js';
import { STATUSES, assert, canPublish, normalize, normalizeOrderNumber } from './control-rules.js';

function now() {
  return new Date().toISOString();
}

function token(prefix) {
  return `${prefix}_${crypto.randomBytes(18).toString('base64url')}`;
}

function audit(order, actor, event, detail = '') {
  order.audit.unshift({ at: now(), actor, event, detail });
  order.updatedAt = now();
}

export function listOrders() {
  return store.orders.map(({ publicToken, ...order }) => ({
    ...order,
    published: Boolean(publicToken)
  }));
}

export function createManualOrder({ orderNumber, customerName }) {
  const normalizedNumber = normalizeOrderNumber(orderNumber);
  const normalizedName = normalize(customerName);
  assert(normalizedNumber, '주문번호를 입력하세요.');
  assert(normalizedName, '주문자명을 입력하세요.');
  assert(!store.orders.some((o) => normalizeOrderNumber(o.orderNumber) === normalizedNumber), '이미 존재하는 주문번호입니다.', 409);

  const order = {
    id: `ord_${crypto.randomUUID()}`,
    orderNumber: normalizedNumber,
    customerName: normalizedName,
    status: STATUSES.ORDER_VERIFIED,
    createdAt: now(),
    updatedAt: now(),
    intake: null,
    draft: null,
    review: { decision: null, note: '' },
    publicToken: null,
    audit: []
  };
  audit(order, 'ADMIN', 'MANUAL_ORDER_CREATED', 'Synthetic/manual portfolio order created.');
  store.orders.unshift(order);
  return order;
}

export function verifyCustomer({ orderNumber, customerName }, ttlMinutes = 120) {
  const normalizedNumber = normalizeOrderNumber(orderNumber);
  const normalizedName = normalize(customerName);
  const order = store.orders.find((o) => normalizeOrderNumber(o.orderNumber) === normalizedNumber);
  assert(order, '등록된 주문을 찾을 수 없습니다.', 404);
  assert(normalize(order.customerName) === normalizedName, '주문자명이 일치하지 않습니다.', 401);

  const sessionToken = token('cust');
  store.customerSessions.set(sessionToken, {
    orderId: order.id,
    expiresAt: Date.now() + ttlMinutes * 60_000
  });
  audit(order, 'CUSTOMER', 'CUSTOMER_VERIFIED', 'Order number + customer name matched.');
  return { token: sessionToken, order: customerView(order) };
}

export function authenticateCustomer(sessionToken) {
  const session = store.customerSessions.get(sessionToken);
  assert(session, '고객 세션이 없습니다.', 401);
  if (session.expiresAt < Date.now()) {
    store.customerSessions.delete(sessionToken);
    assert(false, '고객 세션이 만료되었습니다.', 401);
  }
  const order = store.orders.find((o) => o.id === session.orderId);
  assert(order, '주문을 찾을 수 없습니다.', 404);
  return order;
}

export function submitIntake(order, payload) {
  const intake = {
    recipient: normalize(payload.recipient),
    sender: normalize(payload.sender),
    occasion: normalize(payload.occasion),
    story: normalize(payload.story)
  };
  assert(intake.recipient, '받는 분을 입력하세요.');
  assert(intake.sender, '보내는 분을 입력하세요.');
  assert(intake.story.length >= 20, '사연을 20자 이상 입력하세요.');
  order.intake = intake;
  order.status = STATUSES.INTAKE_SUBMITTED;
  order.draft = null;
  order.review = { decision: null, note: '' };
  order.publicToken = null;
  audit(order, 'CUSTOMER', 'INTAKE_SUBMITTED', `Occasion: ${intake.occasion}`);
  return customerView(order);
}

export function generateDraft(order) {
  assert(order.intake, '고객 입력이 먼저 필요합니다.', 409);
  order.draft = generateMockContent(order.intake);
  order.status = STATUSES.DRAFT_GENERATED;
  order.review = { decision: null, note: '' };
  order.publicToken = null;
  audit(order, 'SYSTEM', 'MOCK_AI_DRAFT_GENERATED', `Genre: ${order.draft.selectedGenre}`);
  return order;
}

export function reviewOrder(orderId, { decision, note }) {
  const order = store.orders.find((o) => o.id === orderId);
  assert(order, '주문을 찾을 수 없습니다.', 404);
  assert(order.draft, '검토할 초안이 없습니다.', 409);
  assert(['APPROVE', 'REQUEST_CHANGE'].includes(decision), '올바른 검토 결정을 선택하세요.');

  order.review = { decision, note: normalize(note) };
  if (decision === 'APPROVE') {
    order.status = STATUSES.APPROVED;
    audit(order, 'ADMIN', 'DRAFT_APPROVED', order.review.note || 'Approved after human review.');
  } else {
    order.status = STATUSES.INTAKE_SUBMITTED;
    order.draft = null;
    order.publicToken = null;
    audit(order, 'ADMIN', 'CHANGE_REQUESTED', order.review.note || 'Revision requested.');
  }
  return order;
}

export function publishOrder(orderId) {
  const order = store.orders.find((o) => o.id === orderId);
  assert(order, '주문을 찾을 수 없습니다.', 404);
  assert(canPublish(order), '승인된 초안만 공개할 수 있습니다.', 409);
  order.publicToken ||= token('pub');
  order.status = STATUSES.PUBLISHED;
  audit(order, 'ADMIN', 'RESULT_PUBLISHED', 'Status gate passed; public result token issued.');
  return { publicToken: order.publicToken, order };
}

export function getPublicResult(publicToken) {
  const order = store.orders.find((o) => o.publicToken === publicToken && o.status === STATUSES.PUBLISHED);
  assert(order, '공개된 결과를 찾을 수 없습니다.', 404);
  return {
    recipient: order.intake.recipient,
    sender: order.intake.sender,
    occasion: order.intake.occasion,
    draft: order.draft
  };
}

export function findOrder(orderId) {
  const order = store.orders.find((o) => o.id === orderId);
  assert(order, '주문을 찾을 수 없습니다.', 404);
  return order;
}

export function customerView(order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    status: order.status,
    intake: order.intake,
    draftReady: Boolean(order.draft),
    published: order.status === STATUSES.PUBLISHED
  };
}
