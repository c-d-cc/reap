# Objective

## Goal
strict 모드 — REAP workflow 없이 소스 수정 방지

## Completion Criteria
1. `.reap/config.yml`에 `strict: true/false` 옵션이 존재한다
2. `session-start.sh`가 strict 설정을 감지하여 AI에게 규칙을 주입한다
3. strict 모드일 때: 활성 Generation이 없거나 implementation stage가 아니면 코드 수정을 거부하는 지시가 주입된다
4. strict 모드일 때: implementation stage에서도 02-planning.md의 task 범위 내에서만 코드 수정이 허용된다
5. strict 모드일 때: 읽기/분석/질문 답변은 허용된다
6. 사용자 명시적 override 요청 시 허용된다 (escape hatch)
7. `bun test`, `bunx tsc --noEmit`, 빌드 통과

## Requirements

### Functional Requirements
- FR-001: `config.yml` 스키마에 `strict: true/false` 필드 추가 (기본값: false)
- FR-002: `session-start.sh`에서 config.yml의 strict 값을 파싱
- FR-003: strict=true일 때 REAP_WORKFLOW 컨텍스트에 Strict Mode 규칙 주입
- FR-004: Strict Mode 규칙: 코드 수정은 implementation stage에서만 허용, 02-planning.md의 task 범위 내로 제한
- FR-005: Strict Mode 규칙: 읽기/분석/질문은 항상 허용
- FR-006: Strict Mode 규칙: 사용자가 "bypass", "override" 등 명시적 요청 시 허용

### Non-Functional Requirements
- strict: false (기본값)이면 기존 동작과 동일
- 추가 의존성 없음 (bash grep/sed로 파싱)

## Scope
- **Related Genome Areas**: domain/hook-system.md
- **Expected Change Scope**: session-start.sh, reap-guide.md (Strict Mode 섹션 추가)
- **Exclusions**: CLI 명령어 추가는 하지 않음 (config.yml 직접 수정)
