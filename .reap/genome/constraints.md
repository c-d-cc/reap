# Technical Constraints

> **작성 원칙**: 이 파일은 ~100줄 이내의 **맵(map)**이어야 한다.
> 기술 선택의 "무엇"뿐 아니라 "왜"를 반드시 기록하라.
> Completion 단계에서만 수정된다.

## Tech Stack

- **Language**: TypeScript 5.x — 타입 안전성 + 에이전트 친화적 코드 생성
- **Runtime**: Node.js 호환 (Bun은 개발/테스트용) — npm publish 시 Node.js에서도 동작
- **CLI Framework**: Commander.js — 성숙한 생태계, 서브커맨드 체인
- **Config Format**: YAML (yaml 라이브러리) — 사람+에이전트 모두 읽기/쓰기 용이
- **Package Manager**: npm (배포), bun (개발)
- **npm Package**: @c-d-cc/reap (scoped) — CLI 명령어는 `reap`

## Constraints

- 파일 I/O는 Node.js fs/promises 사용 (Bun API 직접 사용 금지) — `src/core/fs.ts` 유틸 경유
- 외부 서비스 의존 없음 — 로컬 파일시스템만 사용
- `.reap/` 디렉토리 구조는 init이 보장, 사용자가 수동 생성할 필요 없음
- 슬래시 커맨드, hook → `~/.claude/` (user-level)
- artifact 템플릿, domain 가이드 → `~/.reap/templates/` (user-level)
- genome 파일 → `.reap/genome/` (프로젝트 소유)

## Slash Commands

12개: reap.objective, reap.planning, reap.implementation, reap.validation, reap.completion, reap.evolve, reap.start, reap.next, reap.back, reap.status, reap.sync, reap.help

## Hooks

4개 event: onGenerationStart, onStageTransition, onGenerationComplete, onRegression
2개 type: command (shell), prompt (AI agent instruction)

## Validation Commands

| 용도 | 명령어 | 설명 |
|------|--------|------|
| 테스트 | `bun test` | 전체 단위/통합 테스트 |
| 타입체크 | `bunx tsc --noEmit` | TypeScript 컴파일 검증 |
| 빌드 | `npm run build` | Node.js 호환 번들 + templates 복사 |

## External Dependencies

- 없음 (순수 로컬 CLI 도구)
