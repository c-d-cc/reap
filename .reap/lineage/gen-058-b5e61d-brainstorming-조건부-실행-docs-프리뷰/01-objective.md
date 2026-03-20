# Objective

## Goal
Brainstorming 조건부 실행 + docs 프리뷰 컨펌

## Completion Criteria
1. `reap.objective` 슬래시 커맨드에서 brainstorming이 복잡한 요구사항일 때만 실행된다
2. 단순 태스크(bugfix, config, docs-only)에서는 brainstorming이 스킵된다
3. `docs-update` hook에서 문서 수정 후 docs 앱을 실행하고 유저에게 프리뷰를 보여준다
4. 유저의 명시적 확인 후에만 다음 hook으로 진행한다
5. `bun test` 전체 통과
6. `bunx tsc --noEmit` 통과
7. `npm run build` 성공

## Requirements

### Functional Requirements
- **FR-001**: Brainstorming 진입 조건 — `reap.objective.md` Step 5에 조건부 진입 로직 추가. 목표 복잡도를 평가하여 brainstorming 필요 여부 판단
- **FR-002**: Brainstorming 스킵 기준 — 단순 bugfix, config 변경, docs-only, 명확한 단일 태스크는 기존 Goal+Spec 정의로 직행
- **FR-003**: docs-update hook 프리뷰 — 문서 수정 후 `npm run dev`로 앱 실행, 브라우저에서 변경 페이지 표시, 유저 컨펌 대기
- **FR-004**: docs 프리뷰 거부 시 재수정 — 유저가 수정 요청하면 수정 후 다시 프리뷰

### Non-Functional Requirements
- **NFR-001**: Autonomous Override(evolve) 시에도 docs 프리뷰 유저 컨펌은 반드시 수행 (자동 스킵 불가)

## Design

### Approaches Considered

| Aspect | Approach A: AI 자체 판단 | Approach B: 유저 선택 |
|--------|------------------------|---------------------|
| Summary | AI가 목표 텍스트를 분석하여 복잡도 판단 | 유저에게 "brainstorming 할까요?" 물어봄 |
| Pros | 자동화, 유저 부담 없음 | 항상 정확, 유저 의도 반영 |
| Cons | 오판 가능성 | 매번 질문, 번거로움 |
| Recommendation | ✅ 추천 — 오판 시 유저가 override 가능 | |

### Selected Design
AI가 목표 복잡도를 판단하되, 유저가 명시적으로 override 가능. 판단 기준을 슬래시 커맨드에 명시.

### Design Approval History
- Autonomous Override 적용 — Approach A 자동 선택

## Scope
- **Related Genome Areas**: domain/brainstorm-protocol.md, conventions.md (Template Conventions)
- **Expected Change Scope**: `src/templates/commands/reap.objective.md`, `.reap/hooks/onGenerationComplete.docs-update.md`, `genome/domain/brainstorm-protocol.md`
- **Exclusions**: 비주얼 컴패니언 서버 변경 없음, 기존 brainstorming 기능 자체 변경 없음

## Genome Reference
- `domain/brainstorm-protocol.md` — brainstorming 단계 규칙
- `conventions.md` — Template Conventions

## Backlog (Genome Modifications Discovered)
None

## Background
- gen-057에서 brainstorming이 모든 목표에 강제 적용되도록 구현됨
- 유저 피드백: 복잡한 요구사항일 때만 brainstorming 실행해야 함
- docs-update hook이 자동으로 수정만 하고 유저 확인 없이 넘어가는 문제
