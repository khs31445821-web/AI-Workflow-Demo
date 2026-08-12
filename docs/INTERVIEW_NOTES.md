# Interview Notes

## 30-second explanation

> 반복적인 맞춤형 콘텐츠 업무를 하나의 데이터 흐름으로 구조화해 본 프로젝트입니다. 포트폴리오 공개 과정에서는 실제 운영 코드를 복사하지 않고 clean-room 방식으로 재구현했습니다. 고객 인증, 입력 검증, 생성 결과의 human review, 승인 전 공개 차단, audit trail을 넣어 단순 자동화가 아니라 통제 가능한 업무 프로세스로 설계했습니다.

## What I would emphasize to an accounting / assurance interviewer

1. **Process understanding before coding** — 먼저 주문부터 결과 전달까지 업무 흐름을 분해했습니다.
2. **Risk-based design** — 중복 주문, 권한 혼선, AI 결과 오류, 승인 우회, 추적성 부재를 위험으로 정의했습니다.
3. **Human-in-the-loop** — AI 결과를 자동 확정하지 않고 검토자 승인 단계를 별도로 두었습니다.
4. **Evidence / traceability** — 핵심 상태 변경을 audit event로 남겨 사후 재구성이 가능하도록 했습니다.
5. **IP discipline** — 실제 운영 자산을 공개하지 않고 synthetic data와 mock logic으로 역량만 증명했습니다.

## Questions I would be ready for

- 왜 실제 OpenAI API를 넣지 않았나? → 공개 포트폴리오에서 핵심 역량은 외부 모델 호출이 아니라 프로세스 구조와 통제 설계이기 때문.
- 가장 큰 한계는? → in-memory demo라 영속성/동시성/운영 보안은 의도적으로 제외되어 있음.
- production으로 확장한다면? → DB unique/RLS, secret manager, retry/idempotency, immutable logs, monitoring, role-based approvals 순서로 강화.
