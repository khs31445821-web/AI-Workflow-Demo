# AI Workflow Demo

> **AI-assisted personalized content workflow — Portfolio Demo**  
> 고객 입력부터 콘텐츠 생성, 관리자 검토, 상태 관리, 최종 결과 전달까지 이어지는 업무 흐름을 구조화한 포트폴리오용 데모 프로젝트입니다.

---

## Links

| 구분 | 링크 |
|---|---|
| **Portfolio Demo / GitHub** | 현재 Repository |
| **Live Service** | https://say-melody-production-ffe1.up.railway.app/ |
| **Service Product Page** | https://smartstore.naver.com/thelimekorea/products/11494992666 |

> **Note**  
> 본 Repository는 실제 운영 서비스의 소스코드를 공개한 것이 아닙니다.  
> 실제 프로젝트를 통해 경험한 문제 해결 과정과 시스템 설계 방식을 보여주기 위해,  
> 포트폴리오 목적으로 별도 재구현한 **clean-room demo**입니다.

---

## Overview

개인화된 콘텐츠 서비스는 단순히 AI를 호출해 결과물을 만드는 것으로 끝나지 않습니다.

실제 운영 과정에서는 다음과 같은 흐름이 필요합니다.

```text
Order
  ↓
Customer Verification
  ↓
Customer Input
  ↓
Content Generation
  ↓
Admin Review
  ↓
Approval
  ↓
Publication
  ↓
Final Delivery
```

이 프로젝트는 이러한 반복 업무를 하나의 시스템 흐름으로 구조화하는 데 초점을 두었습니다.

특히 다음 문제를 어떻게 해결할 것인지 고민했습니다.

- 고객과 주문을 어떻게 정확하게 식별할 것인가
- 고객 입력을 어떻게 일정한 데이터 구조로 관리할 것인가
- 자동 생성 결과를 바로 공개하지 않고 어떻게 검토할 것인가
- 현재 진행 상태를 시스템상 어떻게 일관되게 관리할 것인가
- 잘못된 단계 진행이나 중복 처리를 어떻게 방지할 것인가
- 운영에 필요한 추적성과 관리 편의성을 어떻게 확보할 것인가

---

## Why I Built This

실제 서비스 운영에서는 여러 종류의 정보가 서로 연결됩니다.

```text
주문 정보
+ 고객 정보
+ 사연 및 입력 데이터
+ 생성된 콘텐츠
+ 관리자 검토
+ 최종 결과물
```

각 업무가 개별적으로 처리되면 누락, 중복, 상태 혼선, 전달 오류가 발생하기 쉽습니다.

따라서 단순 페이지 제작보다 먼저 업무 전체를 **data flow + state transition** 관점에서 정리하고,  
각 단계가 하나의 프로젝트 단위로 연결되도록 설계했습니다.

---

## Core Features

### 1. Customer Verification

고객은 주문번호와 주문자명을 이용해 자신의 프로젝트에 접근합니다.

```text
Order Number
+
Customer Name
→
Project Verification
```

데모에서는 실제 고객정보 대신 synthetic data를 사용합니다.

---

### 2. Structured Customer Input

고객이 콘텐츠 제작에 필요한 정보를 직접 입력합니다.

예시:

- 받는 사람
- 보내는 사람
- 관계
- 상황
- 사연
- 전달하고 싶은 메시지

입력된 데이터는 하나의 프로젝트에 연결되어 이후 생성 및 검토 단계에서 사용됩니다.

---

### 3. Content Generation

고객 입력을 기반으로 개인화된 초안을 생성합니다.

공개 Repository에서는 실제 운영 프롬프트나 외부 AI credential을 노출하지 않기 위해  
**Local Mock Generator**를 사용합니다.

```text
Customer Input
      ↓
Mock Generator
      ↓
Generated Draft
```

실제 서비스와 동일한 proprietary prompt나 generation logic을 공개하지 않으면서도,  
전체 시스템의 데이터 흐름과 처리 구조를 확인할 수 있도록 구성했습니다.

---

### 4. Admin Workflow

관리자는 프로젝트의 진행 상태와 생성 결과를 확인할 수 있습니다.

주요 기능:

- 주문 및 프로젝트 조회
- 고객 입력 확인
- 생성 결과 확인
- 검토 및 승인
- 프로젝트 상태 변경
- 최종 결과 공개

---

### 5. State Management

프로젝트는 명확한 상태를 가지고 다음 단계로 이동합니다.

```text
ORDER_CREATED
      ↓
CUSTOMER_SUBMITTED
      ↓
DRAFT_GENERATED
      ↓
UNDER_REVIEW
      ↓
APPROVED
      ↓
PUBLISHED
```

각 화면을 단순 연결하는 것이 아니라  
**현재 데이터 상태에 따라 가능한 작업이 달라지는 구조**로 설계했습니다.

---

### 6. Human Review Before Publication

자동 생성된 결과물이 고객에게 바로 노출되지 않도록  
관리자의 검토와 승인 단계를 별도로 두었습니다.

```text
Generated Content
      ↓
Human Review
      ↓
Approval
      ↓
Publication
```

AI를 최종 의사결정자로 두기보다  
**자동화와 사람의 검토를 결합하는 workflow**를 지향했습니다.

---

## Workflow Design

전체 흐름은 다음과 같습니다.

```text
[Order]
   │
   ▼
[Customer Verification]
   │
   ▼
[Customer Input]
   │
   ▼
[Draft Generation]
   │
   ▼
[Admin Review]
   │
   ├── Revision
   │
   ▼
[Approval]
   │
   ▼
[Publication]
   │
   ▼
[Customer Result]
```

---

## Risk & Control Perspective

시스템을 구현하면서 단순 기능 구현뿐 아니라  
각 단계에서 발생할 수 있는 운영상 오류도 함께 고려했습니다.

| Risk | Control / Design |
|---|---|
| 주문 중복 생성 | 주문번호 중복 확인 |
| 다른 고객 데이터 접근 | 주문번호 + 주문자 기반 프로젝트 확인 |
| 필수 정보 누락 | 입력 validation |
| 미완성 결과 공개 | publication state 분리 |
| 자동 생성 결과 오류 | human review 단계 |
| 상태 혼선 | explicit workflow state |
| 민감정보 노출 | synthetic data / environment separation |
| 외부 서비스 의존 | mock generation layer 분리 |

---

## Architecture

```text
┌────────────────────┐
│   Customer UI      │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Application Server │
│                    │
│ Verification       │
│ Validation         │
│ Workflow Logic     │
│ State Management   │
└──────┬────────┬────┘
       │        │
       │        ▼
       │   ┌────────────────┐
       │   │ Mock Generator │
       │   └────────────────┘
       │
       ▼
┌────────────────────┐
│    Demo Data       │
└────────────────────┘

          ▲
          │
┌─────────┴──────────┐
│      Admin UI      │
└────────────────────┘
```

---

## Project Structure

```text
AI-Workflow-Demo/
├─ README.md
├─ NOTICE.md
├─ SECURITY.md
│
├─ data/
│  └─ synthetic-orders.json
│
├─ docs/
│  ├─ ARCHITECTURE.md
│  ├─ DATA_FLOW.md
│  └─ PORTFOLIO_BOUNDARY.md
│
├─ public/
│  ├─ index.html
│  ├─ customer.html
│  ├─ admin.html
│  └─ result.html
│
├─ src/
│  ├─ ai/
│  │  └─ mock-generator.js
│  ├─ data/
│  ├─ domain/
│  ├─ http/
│  └─ server.js
│
├─ package.json
└─ .gitignore
```

---

## Tech Stack

- **Runtime** — Node.js
- **Backend** — Node HTTP Server
- **Frontend** — HTML / CSS / JavaScript
- **Data** — JSON-based demo repository
- **Generation** — Local Mock Generator
- **Version Control** — Git / GitHub

외부 서비스 없이도 포트폴리오 데모를 바로 실행할 수 있도록 의존성을 최소화했습니다.

---

## Run Locally

### Requirements

```text
Node.js 20+
```

### Start

```bash
npm start
```

브라우저에서:

```text
http://localhost:3000
```

---

## Demo Account

### Customer

```text
Order Number: DEMO-2026-0001
Customer Name: 김민준
```

### Admin

```text
Password: portfolio-demo
```

> 위 정보와 Repository 내 모든 고객 데이터는 포트폴리오 시연을 위해 생성된 가상 데이터입니다.

---

## Live Service

이 데모를 만들게 된 배경이 된 실제 서비스는 아래 링크에서 확인할 수 있습니다.

### Service

**SAYMELODY**

https://say-melody-production-ffe1.up.railway.app/

### Product Page

실제 판매 페이지:

https://smartstore.naver.com/thelimekorea/products/11494992666

실제 서비스는 고객 정보 수집, 콘텐츠 제작, 관리자 운영, 결과 전달 등  
보다 많은 기능과 외부 서비스 연동을 포함하고 있습니다.

다만 본 GitHub Repository에는 해당 운영 시스템의 실제 소스코드나  
내부 운영 로직을 그대로 포함하지 않습니다.

---

## Portfolio Boundary

본 Repository는 **포트폴리오 목적의 독립적인 재구현 프로젝트**입니다.

다음 내용은 공개하지 않습니다.

- 실제 운영 서비스 source code
- 실제 고객 개인정보
- 실제 주문 데이터
- 운영 DB
- API Key / Secret
- 환경변수
- proprietary AI prompt
- production-specific business logic
- 외부 주문 플랫폼의 실제 integration code
- commercial image / music / brand assets
- 내부 운영 정책 및 비공개 데이터

모든 고객 및 주문 데이터는 synthetic data입니다.

---

## What This Project Demonstrates

이 프로젝트를 통해 보여주고자 한 핵심은  
특정 프레임워크나 AI API 사용 경험 자체가 아닙니다.

**반복적으로 이루어지는 업무를 분석하고,  
이를 데이터·상태·사용자 역할·처리 단계가 연결된 시스템으로 구조화하는 과정**에 초점을 두었습니다.

```text
Problem
   ↓
Workflow
   ↓
Data Structure
   ↓
Business Logic
   ↓
Validation
   ↓
Human Review
   ↓
State Transition
   ↓
Final Delivery
```

개별 기능을 구현하는 것보다  
각 기능이 전체 업무 흐름에서 어떤 역할을 하는지 이해하고 연결하는 것을 중요하게 생각했습니다.

---

## Repository Notice

This repository is an independently reconstructed clean-room portfolio demonstration.

It does not contain production source code, real customer information, credentials, proprietary prompts, commercial assets, or confidential business data from the live service.

The live-service and product-page links are provided only to demonstrate that the underlying workflow was developed in the context of an actual operating service.
