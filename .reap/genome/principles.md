# Architecture Principles

> **작성 원칙**: 이 파일은 ~100줄 이내의 **맵(map)**이어야 한다.
> 에이전트가 즉시 행동할 수 있는 수준으로 작성하라.
> 상세 내용은 `domain/` 하위 파일로 분리하라.
> Birth 단계에서만 수정된다.

## Core Beliefs

- **Genome은 살아있는 기록이다** — 빈 템플릿이 아니라 에이전트가 즉시 참조할 수 있는 맵
- **Map not Manual** — ~100줄 짧은 진입점, 상세는 domain/으로 분리
- **domain/은 비즈니스 규칙의 상세** — 코드 구조가 아닌 도메인 단위 분리, 코드에서 읽을 수 없는 정책·수치·상태 전이 기록
- **기계적 강제 우선** — 문서 규칙보다 lint/test로 강제할 수 있는 규칙을 우선
- **세대 단위 진화** — 모든 변경은 세대 라이프사이클을 통해 추적된다
- **자기 참조(dog-fooding)** — reap-wf 자체가 REAP 워크플로우로 관리된다

## Architecture Decisions

| ID | 결정 | 사유 | 날짜 |
|----|------|------|------|
| ADR-001 | Bun + TypeScript | 빠른 실행, 내장 테스트, TS 네이티브 지원 | 2026-03 |
| ADR-002 | Commander.js CLI | 성숙한 CLI 프레임워크, 서브커맨드 지원 | 2026-03 |
| ADR-003 | YAML for config/state | 사람이 읽기 쉽고 에이전트가 파싱하기 쉬움 | 2026-03 |
| ADR-004 | 슬래시 커맨드 = .claude/commands 복사 | Claude Code 네이티브 연동, IDE 무관 | 2026-03 |
| ADR-005 | 4축 구조 (genome/environment/life/lineage) | 관심사 분리: 원칙/환경/실행/이력 | 2026-03 |
| ADR-006 | examples/로 실전 검증 | dog-fooding: 같은 repo에서 사용자 경험 검증 가능 | 2026-03 |
| ADR-007 | Legacy 진입 시 자동 아카이빙 | advance()에서 complete() 자동 호출, 수동 단계 제거 | 2026-03 |
| ADR-008 | 중첩 세대 패턴 | dog-fooding 시 외부 프로젝트 세대는 현재 프로젝트 Growth 안에서 실행 | 2026-03 |

## Layer Map

```
templates/        → init 시 복사되는 원본 (genome, commands, artifacts)
core/             → 비즈니스 로직 (generation, mutation, paths)
cli/commands/     → CLI 진입점 (init, evolve, status, fix)
types/            → 공유 타입 정의
```

- `cli/` → `core/` → `types/` (단방향 의존)
- `templates/`는 런타임에 읽기만 함 (코드 의존 없음)
