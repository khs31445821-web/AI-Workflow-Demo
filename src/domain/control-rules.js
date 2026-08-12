export const STATUSES = Object.freeze({
  ORDER_VERIFIED: 'ORDER_VERIFIED',
  INTAKE_SUBMITTED: 'INTAKE_SUBMITTED',
  DRAFT_GENERATED: 'DRAFT_GENERATED',
  APPROVED: 'APPROVED',
  PUBLISHED: 'PUBLISHED'
});

export function normalize(value) {
  return String(value ?? '').trim();
}

export function normalizeOrderNumber(value) {
  return normalize(value).toUpperCase().replace(/\s+/g, '');
}

export function assert(condition, message, statusCode = 400) {
  if (condition) return;
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

export function canPublish(order) {
  return order.status === STATUSES.APPROVED && Boolean(order.draft);
}
