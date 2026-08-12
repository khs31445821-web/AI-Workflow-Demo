# Controls & Risks

This document is intentionally written in an assurance-oriented format: **risk → control objective → implemented demo control → production extension**.

| Risk | Control objective | Demo control | Production extension |
|---|---|---|---|
| Duplicate or fabricated order | only valid/unique orders enter workflow | unique order-number check; pre-seeded synthetic orders | connector idempotency key + DB unique constraint |
| Customer accesses another customer's data | isolate customer scope | verification pair + order-scoped bearer session | signed short-lived JWT + RLS + MFA-sensitive flows |
| Incomplete input drives poor output | ensure minimum input completeness | required fields + minimum story length | schema validation + completeness monitoring |
| Generated content is released without review | require human accountability | generation stops at `DRAFT_GENERATED`; admin approval required | maker-checker role separation |
| Reviewer bypasses approval state | enforce workflow gate | publish allowed only from `APPROVED` | DB state transition constraints |
| Actions cannot be reconstructed | preserve traceability | order-level audit events with actor/time/event | immutable audit store + centralized logs |
| Secrets leak through source | separate configuration | admin password sourced from env | managed secret store / rotation |
| Portfolio leaks commercial IP | demonstrate without production assets | clean-room code, mock generator, synthetic data | legal/IP review before publication |

## Why this matters for assurance work

The technical artifact is secondary to the reasoning pattern: identify the business process, locate failure points, assign control objectives, separate incompatible responsibilities, and preserve evidence of key transitions.
