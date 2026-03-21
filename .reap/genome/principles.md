# Architecture Principles

> **작성 원칙**: 이 파일은 ~100줄 이내의 **맵(map)**이어야 한다.
> 에이전트가 즉시 행동할 수 있는 수준으로 작성하라.
> 상세 내용은 `domain/` 하위 파일로 분리하라.
> Completion 단계에서만 수정된다.

## Core Beliefs

- **Genome은 살아있는 기록이다** — 빈 템플릿이 아니라 에이전트가 즉시 참조할 수 있는 맵
- **Map not Manual** — ~100줄 짧은 진입점, 상세는 domain/으로 분리
- **domain/은 비즈니스 규칙의 상세** — 코드 구조가 아닌 도메인 단위 분리, 코드에서 읽을 수 없는 정책·수치·상태 전이 기록
- **기계적 강제 우선** — 문서 규칙보다 lint/test로 강제할 수 있는 규칙을 우선
- **세대 단위 진화** — 모든 변경은 세대 라이프사이클을 통해 추적된다
- **자기 참조(dog-fooding)** — REAP 자체가 REAP 워크플로우로 관리된다

## Architecture Decisions

| ID | 결정 | 사유 | 날짜 |
|----|------|------|------|
| ADR-001 | TypeScript + Node.js 호환 | 타입 안전성, Bun은 개발/테스트용, 배포는 Node.js 번들 | 2026-03 |
| ADR-002 | Commander.js CLI | 성숙한 CLI 프레임워크, 서브커맨드 지원 | 2026-03 |
| ADR-003 | YAML for config/state | 사람이 읽기 쉽고 에이전트가 파싱하기 쉬움 | 2026-03 |
| ADR-004 | AgentAdapter 추상화 + 멀티 에이전트 지원 | 감지된 에이전트별 commands/hooks 경로에 설치 | 2026-03 |
| ADR-005 | 4축 구조 (genome/environment/life/lineage) | 관심사 분리: 원칙/환경/실행/이력 | 2026-03 |
| ADR-006 | examples/로 실전 검증 | dog-fooding: 같은 repo에서 사용자 경험 검증 가능 | 2026-03 |
| ADR-007 | 5단계 lifecycle (objective~completion) | 8단계에서 간소화, 핵심 단계만 유지 | 2026-03 |
| ADR-008 | user-level 템플릿 (~/.reap/templates/) | 패키지 경로 의존 제거, AI 에이전트가 확정 경로 참조 | 2026-03 |
| ADR-009 | Node.js 호환 빌드 | Bun API→fs/promises 교체, npm publish용 번들 | 2026-03 |
| ADR-010 | npm scoped package (@c-d-cc/reap) | 'reap' 이름 점유, scoped로 배포 | 2026-03 |
| ADR-011 | Script Orchestrator Pattern | Slash command(.md)는 1줄 wrapper, 로직은 `src/cli/commands/run/` script가 담당. deterministic-creative 분리 | 2026-03 |

## Source Map

→ `genome/source-map.md` 참조 (C4 Container + Component 수준 Mermaid 다이어그램)
