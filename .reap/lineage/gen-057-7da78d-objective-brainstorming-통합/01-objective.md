# Objective

## Goal
REAP Objective 단계에 superpowers brainstorming 수준의 상세 설계 디자인 기능 통합

## Completion Criteria
1. `reap.objective` 슬래시 커맨드가 brainstorming 9단계 체크리스트를 포함한다
2. 비주얼 컴패니언 서버가 `node` 명령으로 기동되고, 브라우저에서 HTML 렌더링 + WebSocket 실시간 반영이 동작한다
3. Spec 리뷰 루프가 subagent 호출로 동작하고 최대 3회 반복 후 종료한다
4. `01-objective.md` 템플릿에 Design 섹션이 추가되어 접근법 비교가 기록된다
5. `bun test` 전체 통과
6. `bunx tsc --noEmit` 통과
7. `npm run build` 성공

## Requirements

### Functional Requirements
- **FR-001**: 구조화된 질문 프로토콜 — `reap.objective` 슬래시 커맨드의 Step 5에 "한 번에 하나씩, 객관식 우선" 규칙 추가. 질문 흐름 가이드 명시
- **FR-002**: 2-3개 대안 탐색 — 목표에 대해 접근법 2-3개를 트레이드오프 표와 추천으로 제시하는 단계 추가
- **FR-003**: 섹션별 점진적 디자인 승인 — 디자인을 아키텍처/컴포넌트/데이터흐름/에러처리 등으로 분할, 각 섹션 후 유저 승인
- **FR-004**: Spec 자동 리뷰 루프 — objective artifact 완성 후 subagent 기반 자동 검토, 최대 3회 반복. 검토 기준: 완전성, 일관성, 명확성, 스코프, YAGNI
- **FR-005**: 비주얼 컴패니언 서버 — Node.js 내장 모듈(`http`, `fs`, `crypto`)만으로 로컬 서버 구현. HTML 파일 서빙, WebSocket으로 실시간 반영, `.events` 파일로 유저 인터랙션 수집
- **FR-006**: 비주얼 컴패니언 슬래시 커맨드 통합 — `reap.objective`에서 비주얼 질문이 예상될 때 컴패니언 제안, 브라우저/터미널 판단 규칙 포함
- **FR-007**: 스코프 분해 감지 — 독립 서브시스템 2개 이상 감지 시 Generation 분리 제안. FR 10개 초과 시 자동 경고
- **FR-008**: artifact 템플릿 확장 — `01-objective.md` 템플릿에 Design 섹션 (접근법 비교, 선택된 디자인) 추가

### Non-Functional Requirements
- **NFR-001**: 비주얼 서버는 외부 npm 의존 0개 (Node.js 내장 모듈만 사용)
- **NFR-002**: 서버 30분 미사용 시 자동 종료
- **NFR-003**: 기존 `reap.objective` 7단계 구조 유지 — brainstorming은 Step 5 확장 + 새 Step 추가로 통합
- **NFR-004**: `reap.evolve` 자율 실행 시에도 비주얼 컴패니언 제안 — 유저가 명시적으로 거부하지 않는 한 동일하게 지원

## Scope
- **Related Genome Areas**: conventions.md (Template Conventions), constraints.md (Slash Commands), domain/lifecycle-rules.md (Objective 단계 규칙)
- **Expected Change Scope**: `src/templates/commands/reap.objective.md`, `src/templates/artifacts/01-objective.md`, 새 파일 `src/brainstorm-server/` (서버 코드), `src/templates/commands/` (spec-reviewer 프롬프트)
- **Exclusions**: Planning/Implementation 이후 단계 변경 없음, CLI subcommand 추가 없음 (슬래시 커맨드 전용), 기존 distributed workflow (pull/push/merge) 변경 없음

## Genome Reference
- `conventions.md` — Template Conventions (새 템플릿 추가 시 init.ts 동기화 규칙)
- `constraints.md` — Slash Commands 목록, Validation Commands
- `domain/lifecycle-rules.md` — Objective 단계 artifact 규칙, progressive recording
- `domain/collaboration.md` — 분산 워크플로우 (이번 세대에서 실전 테스트 병행)

## Backlog (Genome Modifications Discovered)
- `genome-brainstorm-protocol.md` — Objective brainstorming 프로토콜 도메인 규칙 (type: genome-change, pending)

## Background
- superpowers brainstorming 스킬 분석 완료: 9단계 체크리스트, 비주얼 컴패니언 (Node.js 내장 서버), spec-document-reviewer subagent, writing-plans 전환
- REAP Objective 현재 상태: 7단계 구조 (Environment Scan ~ Requirements Finalization), brainstorming 없이 바로 goal+spec 정의
- 핵심 갭: 질문 프로토콜, 대안 탐색, 섹션별 승인, spec 리뷰 루프, 비주얼 도구 — 모두 부재
- 이전 세대 (gen-056): 테스트 커버리지 보강 완료 (merge 모듈 55%)
- 이번 세대는 머신B와 병렬 작업으로 distributed workflow 실전 테스트 병행
