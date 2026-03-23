---
type: task
priority: medium
status: pending
---

# Slash command 구조 대규모 통합 (32개 → 2개)

## 개요
현재 32개 slash command를 `/reap` + `/reap.help` 2개로 통합.
CLI `reap` 바이너리는 내부 실행 엔진으로만 존재 (사용자 직접 호출 불필요).
사용자 인터페이스는 오직 slash command.

## 핵심 결정
- 사용자가 CLI를 직접 호출할 일 없음 — 모든 작업은 AI 세션 내에서 `/reap`으로 수행
- `npm install -g` → postinstall이 `/reap`, `/reap.help` 2개를 user-level에 설치
- `/reap init`, `/reap update` 등 모든 명령은 slash command를 통해 AI 세션 내에서 실행

## Slash command 파일 (2개)

| 파일 | description | 역할 |
|------|-------------|------|
| `/reap` | sub-command 목록 나열 | 메인 진입점. 인자 있으면 `reap $ARGUMENTS`, 없으면 command reference 출력 |
| `/reap.help` | "Show REAP commands and workflow" | 초보 사용자용 진입점. `/reap` 인자 없음과 동일 동작 |

## 최상위 명령어 전체 목록

| Command | 하위 인자 | 설명 |
|---------|-----------|------|
| `evolve` | `[recovery\|merge]` | lifecycle 자동 실행. recovery: 복구, merge: merge lifecycle |
| `start` | `<goal>` | generation 시작 |
| `next` | | 다음 stage 전환 |
| `back` | `[stage]` | 이전 stage 회귀 |
| `abort` | | generation 중단 |
| `sync` | `[genome\|environment]` | 동기화. 인자 없으면 all |
| `merge` | `[start\|detect\|mate\|merge\|sync\|validation\|completion]` | merge lifecycle. 인자 없으면 full orchestration. `-b <branch>`는 인자 없음 또는 `start`일 때만 |
| `push` | | 상태 검증 + git push |
| `pull` | | fetch + 원격 감지 |
| `report` | | 버그 리포트 |
| `config` | | 설정 확인 |
| `help` | | 도움말 |
| `status` | | 상태 확인 |
| `init` | `[project-name]` | 프로젝트 초기화 |
| `update` | `[--dry-run]` | REAP 업그레이드 |
| `fix` | `[--check]` | 구조 검사/수정 |
| `destroy` | | 프로젝트 제거 |
| `clean` | | 프로젝트 리셋 |
| `run` | `<stage>` `[--phase <phase>]` | lifecycle stage 직접 실행 |
| `util` | `refreshKnowledge\|update-genome` | 유틸리티 |

## 사용 예시
```
/reap evolve                          # normal lifecycle 자동
/reap evolve recovery                 # 복구 generation
/reap evolve merge                    # merge lifecycle 자동
/reap start "Add login feature"       # generation 시작
/reap sync genome                     # genome만 동기화
/reap merge -b feature-branch         # merge full orchestration
/reap merge start -b feature-branch   # merge 특정 stage
/reap run planning                    # planning stage 진입
/reap run planning --phase complete   # planning complete phase
/reap util refreshKnowledge           # 컨텍스트 새로고침
/reap status                          # 상태 확인
```

## Command 설치 위치 변경

**현재:**
```
~/.reap/commands/reap.*.md (32개, source of truth)
  → session-start hook이 프로젝트별 .claude/skills/reap.*/SKILL.md로 복사
```

**변경 후:**
```
~/.claude/commands/reap.md (user-level)
~/.claude/commands/reap.help.md (user-level)
```

- 32개를 프로젝트별로 복사하던 이유: skill matching을 위해 개별 파일 필요
- 2개면 user-level root에 두는 게 자연스러움
- session-start hook의 command 복사 로직 제거
- `reap init`/`reap update`의 프로젝트별 설치 로직 제거
- AgentAdapter의 command 설치 대폭 단순화
- `~/.reap/commands/` 디렉토리 자체가 불필요해질 수 있음

## postinstall 안내 메시지

기존 `reap init`의 안내 메시지를 postinstall로 이동:
```
✓ REAP installed successfully!

  Start a new project:  /reap init
  Show help:            /reap.help

  Available in: Claude Code
```

## 주요 변경 사항
- 32개 `.md` 템플릿 → 2개 (`reap.md`, `reap.help.md`)
- user-level 설치 (`~/.claude/commands/`)
- session-start hook의 command 복사 로직 제거
- AgentAdapter command 설치 로직 단순화
- postinstall에서 안내 메시지 출력
- CLI 최상위 명령어 라우팅 추가 (evolve, start, sync, merge, next, back, abort 등)
- `~/.reap/commands/` 디렉토리 폐기

## 순서
다른 모든 backlog 완료 후 마지막에 진행 (대규모 변경).
