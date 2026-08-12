import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.resolve(__dirname, '../../data/synthetic-orders.json');
const seedOrders = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

export const store = {
  orders: seedOrders.map((order) => ({
    ...order,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    intake: null,
    draft: null,
    review: { decision: null, note: '' },
    publicToken: null,
    audit: [
      {
        at: new Date().toISOString(),
        actor: 'SYSTEM',
        event: 'ORDER_SEEDED',
        detail: 'Synthetic portfolio order initialized.'
      }
    ]
  })),
  adminSessions: new Map(),
  customerSessions: new Map()
};
