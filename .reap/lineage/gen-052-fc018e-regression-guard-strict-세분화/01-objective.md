# Objective

## Goal

세 가지 경량 개선: (1) regression 시 planning append 규칙, (2) evolve에서 current.yml 직접 수정 방지 guard 강화, (3) strict 모드 세분화 (edit + merge)

## Completion Criteria

1. `domain/lifecycle-rules.md` — regression artifact 처리에서 planning도 append 명시
2. `reap.evolve` slash command — stage 전환 시 `/reap.next` 호출을 HARD-GATE로 강제하는 문구 강화
3. `reap.next` slash command — current.yml 직접 수정이 아닌 GenerationManager/CLI를 통한 전환임을 명시
4. `src/types/index.ts` — `ReapConfig.strict`가 `boolean | { edit?: boolean; merge?: boolean }` 지원
5. `src/core/config.ts` — strict 파싱 시 boolean → object 변환
6. `src/templates/hooks/genome-loader.cjs` — strictMerge 빌드 로직
7. `bunx tsc --noEmit`, `bun test`, `npm run build` 통과

## Requirements

### Functional Requirements

- **FR-001**: lifecycle-rules.md — "target stage: 덮어쓰기 (planning과 implementation은 append)"
- **FR-002**: reap.evolve.md — HARD-GATE 문구에 "stage 전환은 반드시 /reap.next slash command 호출" 재강조
- **FR-003**: reap.next.md — "이 command가 current.yml stage를 변경하는 유일한 정당한 방법" 명시
- **FR-004**: ReapConfig.strict 타입 확장 — `boolean | { edit?: boolean; merge?: boolean }`
- **FR-005**: config.ts — `resolveStrict(config)` 함수: boolean이면 `{ edit, merge }` 객체로 변환
- **FR-006**: genome-loader.cjs — strictMerge 시 session-start에 git 명령 경고 메시지 추가
- **FR-007**: session-start hook 출력에 strictMerge 상태 표시

### Non-Functional Requirements

- `strict: true` 하위 호환 유지
- 커밋은 사용자 ok 시만

## Scope
- **Related Genome Areas**: domain/lifecycle-rules.md, constraints.md
- **Expected Change Scope**: genome domain, slash commands, src/types/, src/core/config.ts, genome-loader.cjs
- **Exclusions**: git hook 설치 (별도 generation), docs 업데이트 (별도 generation)

## Genome Reference
- lifecycle-rules.md: regression artifact 처리 규칙
- constraints.md: strict 모드 설명

## Backlog (Genome Modifications Discovered)
None

## Background
gen-051에서 AI가 /reap.next를 거치지 않고 current.yml을 직접 수정하는 위반 발생. 또한 regression 시 planning이 덮어쓰기되어 기존 task가 유실되는 문제 발견. strict 모드는 현재 코드 수정만 제어하지만, merge 환경에서 git 명령도 제어할 필요가 있음.
