---
id: idea-dc2e56
slug: 제품-기획-방법론
kind: file
title: IT 서비스·제품 기획을 체계화하는 방법
createdAt: 2026-08-23T07:15:56Z
status: open
---

## 무엇이 미정인가

**REAP에 제품 기획 체계가 없다.** plan source를 등록하고 인용하는 배관은 있지만, **그 안에 무엇이 어떤 구조로 들어가야 하는지**는 정한 적이 없다. `ms-010`이 그 자리를 채우려다 틀린 모양(track)을 만들고 철회됐다(`gen-0044-plan`).

이 문서는 그 빈칸에 후보를 준다 — **수렴 파이프라인**(Vision→…→Delivery), **Product/Capability/Feature/Requirement backbone**, **문서를 그래프로 보는 관점**, 그리고 *"기획의 목적은 문서 작성이 아니라 불확실성 제거"*.

**아직 채택 안 했다.** REAP가 세 층(판단/확정/사실)과 두 축(plan/exec) 위에 서 있으므로, 이 방법론의 어느 조각이 어느 층에 앉는지가 정해져야 쓸 수 있다.

## 무엇이 정해지면 졸업하는가

**어느 조각을 REAP가 갖고 어느 조각을 안 갖는지가 정해지면** `environment/resources/`로 옮기거나(계속 참조하면) `plan source`로 졸업한다(REAP의 규범이 되면).

구체적으로 답할 것:

1. **계층(Vision→Capability→Feature→Requirement)을 REAP가 강제하는가, 아니면 plan source의 관례로 두는가.** REAP는 "작업의 모양을 결정하지 않는다"가 원칙이다
2. **traceability를 무엇이 담는가.** `refs`가 `<ps-id>:<경로>`까지만 가리키는 지금으로 충분한지
3. **`milestone`과 `Delivery Planning`의 관계.** 이 문서의 10단계 중 마지막이 milestone/backlog인데 REAP는 거기부터 이미 있다
4. **`author-plan`이 이 파이프라인을 이끄는가.** 저장 단위가 아니라 과정이라면 skill의 것이다

## 출처

- 사람이 준 문서 · `~/Downloads/it-product-planning-methodology.md` · 2026-08-23 가져옴
- **2차 자료** — 여러 방법론(Design Thinking · Double Diamond · Lean · Opportunity Solution Tree · User Story Mapping · DDD)의 요약과 조합안이다. 각 방법론의 1차 출처는 여기 없다

---

## IT 서비스·제품 기획을 체계화하는 방법

### 질문

IT 서비스, 제품을 기획하는 것을 생각해보자. 개발을 하기 전에 먼저 산더미 같은 기획을 하게 된다. 기획의 목표는 제품, 서비스를 정의하게 되는 문서 산출물을 만들면서, 개발의 토대가 되는 요구사항, 기능들을 정의하는 일이 될 것이다.

이때 이 기획을 체계화하는 방법론이 있는지 궁금하다.

---

### 답변

있다. 다만 **“IT 제품 기획 방법론”이라는 하나의 표준 방법론**이 있는 것은 아니고, 실제 현장에서는 여러 방법론을 조합한다.

특히 다음과 같은 작업은 보통 **Product Discovery → Product Definition → Delivery Planning**이라는 흐름으로 보는 것이 가장 깔끔하다.

> 개발 전에 충분한 기획을 수행하고, 제품을 정의하며, 개발의 토대가 되는 요구사항·기능·정책을 만든다.

핵심은 문서를 많이 만드는 것이 아니라 **추상적인 아이디어를 점점 개발 가능한 명세로 수렴시키는 과정**을 체계화하는 것이다.

---

### 1. 기획을 하나의 수렴 파이프라인으로 보기

대략 다음과 같이 내려온다.

```text
WHY
왜 이 제품을 만드는가?
        ↓
PROBLEM
누구의 어떤 문제를 해결하는가?
        ↓
OUTCOME
무엇이 달라지면 성공인가?
        ↓
PRODUCT
그래서 어떤 제품이어야 하는가?
        ↓
CAPABILITY
제품이 무엇을 할 수 있어야 하는가?
        ↓
FEATURE
어떤 기능들이 필요한가?
        ↓
BEHAVIOR / RULE
각 기능은 정확히 어떻게 동작하는가?
        ↓
DATA / DOMAIN
어떤 데이터와 개념을 관리하는가?
        ↓
UX / FLOW
사용자는 어떤 흐름으로 사용하는가?
        ↓
SYSTEM
시스템은 이를 어떻게 구현하는가?
        ↓
DELIVERY
어떤 순서로 개발하는가?
```

좋은 기획 체계의 핵심은 이 **traceability**, 즉 위아래 연결이 유지되는 것이다.

예를 들어 다음과 같이 연결할 수 있다.

```text
Goal
꽃집의 전화 예약 업무를 줄인다.

Problem
전화로 예약을 받아 누락/중복 예약이 발생한다.

Outcome
전화 예약 비율을 70% → 20%로 낮춘다.

Capability
고객이 온라인으로 주문 예약을 할 수 있다.

Feature
예약 생성
예약 변경
예약 취소
예약 현황 조회

Requirement
고객은 수령일 30일 전부터 예약할 수 있다.
같은 시간대의 최대 주문량은 10개다.

Domain
Customer
Reservation
Product
PickupSlot
Payment

UI Flow
상품 선택 → 날짜 선택 → 옵션 선택 → 결제 → 예약 완료

API
POST /reservations
GET /available-slots
...
```

이렇게 되면 개발자는 **“이 기능이 왜 있는지”**까지 거슬러 올라갈 수 있다.

---

### 2. 실제로 존재하는 대표적인 방법론들

각각 해결하는 영역이 조금씩 다르다.

#### 2.1 Design Thinking

가장 상위 단계의 문제 발견과 해결 아이디어 도출에 강하다.

```text
Empathize
   ↓
Define
   ↓
Ideate
   ↓
Prototype
   ↓
Test
```

주로 다음 질문에 답한다.

> 우리가 무엇을 만들어야 하지?

다만 개발 요구사항까지 내려가기에는 부족하다.

---

#### 2.2 Double Diamond

제품 기획의 전체 구조를 잡기에 좋다.

```text
Discover
   ↓
Define
   ↓
Develop
   ↓
Deliver

발산 → 수렴 → 발산 → 수렴
```

중요한 점은 처음부터 기능을 정의하지 않는다는 것이다.

예를 들어 다음처럼 출발하지 않는다.

```text
"예약 시스템을 만든다"
```

대신 다음 질문부터 시작한다.

```text
"고객과 꽃집 사이에서 주문을 조율할 때
어떤 문제가 발생하는가?"
```

---

#### 2.3 Lean Product / Lean Startup

문서를 완벽하게 만드는 것보다 **가설 검증**을 강조한다.

```text
Problem hypothesis
        ↓
Solution hypothesis
        ↓
MVP
        ↓
Measure
        ↓
Learn
```

스타트업이나 신규 서비스에서는 특히 중요하다.

기획 단계에서 흔히 발생하는 문제는 다음과 같다.

> 3개월 동안 150페이지짜리 기획서를 만들었는데  
> 고객이 원하지 않는 제품이었다.

---

#### 2.4 Opportunity Solution Tree

Teresa Torres가 제안한 방식으로, 제품 기획을 구조화하는 데 매우 유용하다.

```text
Outcome
│
├── Opportunity A
│   ├── Solution A1
│   └── Solution A2
│
├── Opportunity B
│   ├── Solution B1
│   └── Solution B2
│
└── Opportunity C
```

이 구조의 장점은 **문제와 기능을 분리한다는 것**이다.

많은 기획서는 처음부터 다음처럼 Feature 목록으로 시작한다.

```text
회원가입
대시보드
알림
검색
관리자
```

그러면 왜 필요한 기능인지 사라진다.

Opportunity Solution Tree에서는 다음처럼 연결한다.

```text
Outcome
예약 누락 감소

Opportunity
고객이 예약 상태를 모른다

Solution
예약 상태 화면
알림
카카오톡 안내
```

---

### 3. 개발 직전 단계에서는 User Story Mapping이 강력하다

Jeff Patton의 **User Story Mapping**이다.

예를 들어 쇼핑몰이라면 다음과 같이 사용자 활동을 구조화할 수 있다.

```text
탐색
 ├ 상품 검색
 ├ 카테고리 탐색
 └ 추천

구매
 ├ 장바구니
 ├ 주문
 └ 결제

배송
 ├ 배송 조회
 └ 배송 변경
```

그리고 세로 방향으로 중요도를 정한다.

```text
               탐색       구매       배송
------------------------------------------------
MVP            검색       주문       배송조회
------------------------------------------------
Release 2      추천       쿠폰       주소변경
------------------------------------------------
Release 3      개인화     포인트     실시간추적
```

이렇게 하면 자연스럽게 다음 세 가지가 동시에 나온다.

- 제품 구조
- 기능 구조
- MVP Scope

---

### 4. 복잡한 업무 시스템이라면 DDD도 기획에 유용하다

DDD는 개발 방법론으로만 보기 쉽지만, 실제로는 **업무 개념을 정의하는 방법론**으로도 매우 중요하다.

예를 들어 예약 서비스에서 다음 개념을 정의할 수 있다.

```text
Reservation
Customer
Product
Store
Pickup
Payment
Cancellation
```

그리고 관계를 찾는다.

```text
Customer
   │
   └── Reservation
           │
           ├── ReservationItem
           │       └── Product
           │
           ├── PickupSlot
           │
           └── Payment
```

이 단계가 잘 되어 있으면 DB, API, Backend, Frontend 구조가 상당히 자연스럽게 나온다.

특히 ERP, CRM, 제조, 물류 같은 **업무 시스템은 Feature List보다 Domain Model이 훨씬 중요하다.**

---

### 5. 실제 제품 기획에서는 방법론을 조합하는 것이 좋다

하나의 방법론만 선택하기보다는 다음과 같이 조합할 수 있다.

```text
┌──────────────────────────────┐
│ 1. Product Vision            │
│ 왜 만드는가                  │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ 2. Problem Discovery         │
│ 사용자 / 문제 / Pain Point   │
│ Design Thinking              │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ 3. Outcome Definition        │
│ 어떤 결과를 만들 것인가      │
│ KPI / Success Metric         │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ 4. Opportunity Mapping       │
│ 문제 → 기회 → 해결책         │
│ Opportunity Solution Tree    │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ 5. Product Structure         │
│ Capability / Feature         │
│ User Story Mapping           │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ 6. Domain Modeling           │
│ Entity / Rule / Lifecycle    │
│ DDD                          │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ 7. UX Definition             │
│ Persona / Journey / Flow     │
│ Wireframe                    │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ 8. Requirement Definition    │
│ Functional / Non-functional  │
│ Business Rule                │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ 9. System Definition         │
│ API / Data / Architecture    │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ 10. Delivery Planning        │
│ MVP / Milestone / Backlog    │
└──────────────────────────────┘
```

이것은 사실상 **기획 → 개발 specification compiler** 같은 구조다.

---

### 6. Capability 계층을 두는 것이 중요하다

Feature보다 한 단계 위에 **Capability**를 두면 제품 구조가 안정된다.

예를 들어 다음과 같다.

```text
PRODUCT
온라인 꽃집 운영 플랫폼

CAPABILITY
├─ 고객 관리
├─ 상품 관리
├─ 예약 관리
├─ 주문 관리
├─ 결제 관리
└─ 매장 운영
```

그 아래에는 Feature가 위치한다.

```text
예약 관리

├ 예약 생성
├ 예약 변경
├ 예약 취소
├ 예약 검색
├ 예약 승인
├ 예약 상태 관리
└ 예약 알림
```

그리고 Feature 아래에는 Requirement가 위치한다.

```text
예약 생성

Requirements
├ 고객을 선택할 수 있다.
├ 상품을 하나 이상 선택한다.
├ 수령 일시를 지정한다.
├ 수령 방법을 지정한다.
└ 예약번호가 자동 생성된다.
```

기능은 자꾸 늘어나지만 Capability는 비교적 안정적이다.

따라서 다음 구조를 **제품 specification의 backbone**으로 사용할 수 있다.

```text
Product
   ↓
Capability
   ↓
Feature
   ↓
Requirement
```

---

### 7. 문서도 계층화해야 한다

기획이 커질수록 다음과 같은 문제가 생긴다.

```text
기획/
├ 기획안최종.docx
├ 기획안최종_v2.docx
├ 요구사항.xlsx
├ 정책정의.xlsx
├ 화면기획.pptx
├ 회의록
├ 검토사항
├ 기능정의
├ 개발요청사항
└ ...
```

어느 순간 **무엇이 authoritative source인지 아무도 모르게 된다.**

그래서 문서를 역할별로 계층화해야 한다.

예를 들면 다음과 같다.

```text
/product

01-vision
    product-vision.md
    goals.md

02-problem
    personas.md
    pain-points.md
    opportunities.md

03-domain
    domain-model.md
    glossary.md
    business-rules.md

04-capabilities
    customer-management.md
    reservation-management.md
    order-management.md

05-features
    reservation-create.md
    reservation-cancel.md
    reservation-search.md

06-ux
    journeys.md
    flows.md
    wireframes/

07-requirements
    functional.md
    non-functional.md

08-system
    architecture.md
    api.md
    data-model.md

09-delivery
    milestones.md
    backlog.md

10-decisions
    ADR/
```

중요한 것은 폴더 이름 자체가 아니라 **정보의 역할을 분리하는 것**이다.

---

### 8. Feature만으로는 부족하고 Business Rule이 필요하다

예를 들어 다음 기능이 있다고 하자.

> 예약 취소 기능

이것만으로는 개발할 수 없다.

개발자는 곧바로 다음과 같은 질문을 하게 된다.

```text
언제까지 취소할 수 있는가?

결제 후에도 취소 가능한가?

당일 취소 가능한가?

부분 취소 가능한가?

취소 수수료는?

판매자가 취소할 수도 있는가?

이미 제작 시작한 상품은?

환불 방식은?

쿠폰은 복구되는가?
```

이것이 **Business Rule / Policy**다.

따라서 실제 개발 가능한 요구사항이 되려면 다음 단계까지 내려가야 한다.

```text
Feature
       ↓
Business Rule
       ↓
State Transition
       ↓
Edge Case
```

---

### 9. 이상적인 기획 시스템은 문서 집합보다 그래프에 가깝다

좋은 기획 시스템은 사실 **문서 집합이라기보다 그래프**에 가깝다.

```text
Vision
   │
Goal
   │
Outcome
   │
Problem
   │
Opportunity
   │
Capability
   │
Feature
   │
Requirement
   ├── Business Rule
   ├── UX Flow
   ├── Domain Model
   └── NFR
          │
       Implementation
```

그리고 각 항목에는 다음과 같은 메타정보를 붙일 수 있다.

```text
WHY?
무엇 때문에 생겼는가?

WHAT?
무엇을 정의하는가?

DEPENDENCY?
무엇과 관련되는가?

STATUS?
검토중 / 승인 / 폐기

OWNER?
누가 책임지는가?
```

이렇게 하면 기획서를 단순히 읽는 것이 아니라 **제품 정의를 탐색할 수 있게 된다.**

---

### 10. 기획의 목적을 “문서 작성”이 아니라 “불확실성 제거”로 보기

기존 방식은 보통 다음과 같다.

> 개발하기 전에 완벽한 기획서를 만든다.

하지만 더 좋은 관점은 다음과 같다.

> **제품에 대한 불확실성을 단계적으로 제거한다.**

그러면 각 산출물의 존재 이유도 명확해진다.

| 단계 | 없애려는 불확실성 |
|---|---|
| Vision | 왜 만드는가 |
| Problem | 어떤 문제인가 |
| Outcome | 무엇을 성공이라 하는가 |
| Opportunity | 어디를 해결할 것인가 |
| Capability | 제품이 무엇을 할 수 있어야 하는가 |
| Domain | 어떤 개념과 규칙이 존재하는가 |
| Feature | 사용자가 무엇을 할 수 있는가 |
| UX Flow | 어떻게 사용하는가 |
| Requirement | 정확히 어떻게 동작하는가 |
| Architecture | 어떻게 구현할 것인가 |
| Milestone | 어떤 순서로 만들 것인가 |

핵심 원칙은 다음과 같다.

> **어떤 문서도 새로운 불확실성을 제거하지 않는다면, 그 문서는 만들 필요가 없을 가능성이 높다.**

---

### 11. AI Agent 기반 개발과의 연결

이 구조는 AI Agent를 이용한 개발과도 잘 맞는다.

예를 들어 다음 관계를 명시적으로 만들어 두면:

```text
Vision
  ↓
Capability
  ↓
Feature
  ↓
Requirement
  ↓
Decision
  ↓
Implementation
```

에이전트에게 단순히 수십 개 문서를 던지는 것보다 훨씬 안정적인 컨텍스트를 제공할 수 있다.

특히 기획 초기에는 Requirement와 Decision이 강한 anchor 역할을 하고, 구현이 충분히 안정화된 뒤에는 source code와 test가 사실상의 authoritative source가 되면서 일부 planning artifact의 중요도를 낮추는 식으로 확장할 수 있다.

즉, 기획 체계는 정적인 문서 창고가 아니라 다음과 같이 볼 수 있다.

> **제품의 불확실성을 제거하고, 결정의 근거를 유지하며, 개발 가능한 형태로 점진적으로 수렴시키는 지식 구조**
