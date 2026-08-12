# Security Notes

This repository is intentionally a local portfolio demo, not a production system.

Controls demonstrated:
- role-separated admin/customer access;
- short-lived in-memory bearer sessions;
- order-scoped customer sessions;
- duplicate order prevention;
- workflow status gates before publication;
- audit-event logging for key state changes;
- synthetic-only data;
- secrets kept outside source through environment variables.

Production hardening that is intentionally out of scope:
- persistent session store / token rotation;
- rate limiting and bot controls;
- database-level row security;
- encrypted persistent storage;
- SSO/MFA;
- production-grade observability and alerting;
- external API retry queues and idempotency keys.
