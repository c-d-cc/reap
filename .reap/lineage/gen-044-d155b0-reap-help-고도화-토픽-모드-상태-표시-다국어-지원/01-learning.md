# Learning — gen-044-d155b0

## Goal
reap help 고도화 — 토픽 모드, 상태 표시, 다국어 지원

## Project Overview
REAP v0.16.0의 `reap help` 명령은 현재 하드코딩된 단순 텍스트만 출력. v0.15에는 토픽 모드, 다국어 지원, 상태 표시가 있었으나 v0.16 이식 시 누락됨.

## Key Findings

### 현재 상태 (v0.16)
- `src/cli/commands/help.ts`: 단순 `emitOutput`으로 하드코딩된 영문 텍스트 출력
- `src/cli/index.ts`: `reap help` 명령에 인자(topic) 지원 없음
- `src/adapters/claude-code/skills/reap.help.md`: 단순히 `reap help` 호출만

### v0.15 참조 (`~/cdws/reap_v15/src/cli/commands/run/help.ts`)
- 4개 언어(en/ko/ja/zh-CN) 지원, `LANGUAGE_ALIASES` 매핑 (korean→ko 등)
- `REAP_INTRO`, `COMMAND_DESCRIPTIONS`, `TOPICS_LINE`, `CONFIG_LINE` 다국어 맵
- topic 모드: `reap-guide.md`를 context로 AI에게 토픽 설명 위임 (`status: "prompt"`)
- 미지원 언어: AI에게 번역 위임 (`status: "prompt"`)
- 상태 표시: `GenerationManager.current()` 로 현재 generation 정보 표시
- v0.15에서는 `reap run help`로 실행 (run 하위 명령)

### 이식 계획 핵심 차이
1. **명령 위치**: v0.15는 `reap run help <topic>` → v0.16은 `reap help [topic]` (top-level)
2. **경로 체계**: v0.15는 `ReapPaths.packageHooksDir` → v0.16은 `createPaths(cwd)` + 템플릿 디렉토리
3. **출력 인터페이스**: v0.15는 `emitOutput` (다른 시그니처) → v0.16은 `emitOutput(ReapOutput)`
4. **config 읽기**: v0.15는 raw string 파싱 → v0.16도 동일하게 `readTextFile` 사용
5. **command 테이블**: v0.16 slash commands로 업데이트 필요 (v0.15에 있던 일부 명령은 v0.16에 없음)

### 필요한 변경 파일
- `src/cli/commands/help.ts` — 전면 재작성
- `src/cli/index.ts` — help 명령에 `[topic]` 인자 추가
- `src/adapters/claude-code/skills/reap.help.md` — `reap help` 호출 (토픽 전달)

### reap-guide.md 위치
- 템플릿: `src/templates/reap-guide.md`
- 설치 위치: `.reap/reap-guide.md` (프로젝트)
- help에서는 프로젝트 `.reap/reap-guide.md`를 읽음 (paths에 없으므로 직접 join)

### 테스트 현황
- 기존 help 관련 테스트 없음 (cli-commands.test.ts에 `--help` 플래그 테스트만 존재)
- 신규 테스트 필요: help 기본 출력, 토픽 모드, 다국어 출력

## Backlog Review
- 이번 generation에서 소비: `reap-help-고도화-토픽-모드-상태-표시-다국어-지원.md`
- pending backlog: 없음

## Context for This Generation
- Generation type: embryo (genome 수정 가능)
- Config language: korean
- Clarity: **HIGH** — backlog이 구체적이고 v0.15 참조 코드가 명확함. 변경 범위도 한정적.
- help 출력에 CLI commands는 포함하지 않음 (사용자가 직접 입력 안 함) — slash commands만 표시
