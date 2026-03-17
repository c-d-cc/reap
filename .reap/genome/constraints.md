# Technical Constraints

> **작성 원칙**: 이 파일은 ~100줄 이내의 **맵(map)**이어야 한다.
> 기술 선택의 "무엇"뿐 아니라 "왜"를 반드시 기록하라.
> Completion 단계에서만 수정된다.

## Tech Stack

- **Language**: TypeScript 5.x — 타입 안전성 + 에이전트 친화적 코드 생성
- **Runtime**: Bun 1.x — 빠른 실행, 내장 테스트 러너, TS 네이티브
- **CLI Framework**: Commander.js — 성숙한 생태계, 서브커맨드 체인
- **Config Format**: YAML (yaml 라이브러리) — 사람+에이전트 모두 읽기/쓰기 용이
- **Package Manager**: bun

## Constraints

- Node.js API 호환 유지 (Bun 외 런타임에서도 동작 가능해야 함)
- 외부 서비스 의존 없음 — 로컬 파일시스템만 사용
- `.reap/` 디렉토리 구조는 init이 보장, 사용자가 수동 생성할 필요 없음
- 템플릿 원본은 `src/templates/`에만 존재. 슬래시 커맨드와 hook은 user-level(`~/.claude/`)에 설치, genome은 프로젝트에 복사, artifact 템플릿은 패키지 내부에서 직접 참조

## Validation Commands

| 용도 | 명령어 | 설명 |
|------|--------|------|
| 테스트 | `~/.bun/bin/bun test` | 전체 단위/통합 테스트 |
| 타입체크 | `~/.bun/bin/bunx tsc --noEmit` | TypeScript 컴파일 검증 |

## External Dependencies

- 없음 (순수 로컬 CLI 도구)
