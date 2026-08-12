# Data Flow

| Stage | Input | Validation / Control | Output |
|---|---|---|---|
| Order | synthetic order no. + name | unique order number | verified order record |
| Customer verification | order no. + name | exact pair match; scoped session | customer bearer token |
| Intake | recipient, sender, occasion, story | required fields; minimum story length | normalized intake |
| Generation | normalized intake | local mock only | draft content |
| Review | draft | explicit admin decision | approved or returned |
| Publish | approved draft | status gate | public result token |
| Result | public token | token must map to PUBLISHED order | read-only result |

No production PII or secrets are required anywhere in the flow.
