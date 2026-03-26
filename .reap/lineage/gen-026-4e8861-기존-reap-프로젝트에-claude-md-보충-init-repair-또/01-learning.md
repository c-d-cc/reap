# Learning — gen-026-4e8861

## Source Backlog

`claude-md-migration.md` — 기존 reap 프로젝트에 CLAUDE.md 추가 (migration)
- 이미 `.reap/`으로 관리되고 있는 프로젝트는 `reap init`에서 re-init이 차단됨
- 이 프로젝트들에 CLAUDE.md가 없을 수 있음 (reap 업데이트 후 CLAUDE.md 기능이 추가된 경우)
- `reap init --repair` 또는 `install-skills` 확장으로 CLAUDE.md를 추가해야 함

## Key Findings

### 현재 CLAUDE.md 생성 로직
- `src/cli/commands/init/common.ts`의 `initCommon()` 함수에서 CLAUDE.md 처리
  - CLAUDE.md 없음 → 새로 생성 (`# {projectName}\n` + reap section)
  - CLAUDE.md 있고 reap 섹션 없음 → append
  - CLAUDE.md 있고 reap 섹션 있음 → skip
- `getClaudeMdSection()` 함수가 이미 public으로 export됨 → 재사용 가능
- 템플릿: `src/templates/claude-md-section.md` — `.reap/genome/` 포함 여부로 reap 섹션 판별

### installSkills 현재 구현
- `src/adapters/claude-code/install.ts` — skill 파일만 `~/.claude/commands/`에 복사
- `postinstall`에서 자동 실행됨 (`node dist/cli/index.js install-skills`)
- 프로젝트 root와 무관하게 동작 (user-level 설치)
- `_projectRoot` 파라미터를 받지만 사용하지 않음

### init 차단 로직
- `src/cli/commands/init/index.ts` L61: `fileExists(paths.config)` → 이미 있으면 에러 반환
- `--repair` 옵션은 현재 없음

### CLI 구조
- `src/cli/index.ts`에서 커맨드 등록
- 패턴: `execute()` 함수를 별도 파일에서 export → index.ts에서 import + action 등록

## 접근 방식 분석

### Option 1: install-skills 확장
- **장점**: postinstall에서 자동 실행 → npm update만 해도 CLAUDE.md 자동 보충
- **단점**: install-skills의 의미와 맞지 않음 (skill 파일 ≠ CLAUDE.md). CLAUDE.md는 프로젝트별 파일인데 install-skills는 user-level 동작. `.reap/` 존재 확인 필요.

### Option 2: init --repair
- **장점**: 의미가 명확 (init의 누락 파일 보충)
- **단점**: init 명령에 새 분기가 추가됨. re-init 차단 로직과 공존해야 함.

### Option 3: install-skills에서 CLAUDE.md 처리 (프로젝트 감지형)
- **장점**: postinstall 자동 실행. cwd에 `.reap/`이 있으면 CLAUDE.md 확인/보충.
- **단점**: postinstall은 npm 패키지 디렉토리에서 실행됨 → cwd가 사용 프로젝트가 아닐 수 있음.

### 결론: Option 2 — init --repair 방식 채택
- `reap init --repair`: `.reap/`이 이미 있는 프로젝트에서, 누락된 파일만 보충
- CLAUDE.md 보충은 `initCommon.ts`의 기존 로직을 재사용
- 향후 다른 누락 파일도 repair로 보충 가능 (확장성)
- 의미적으로 가장 자연스러움

## Previous Generation Reference

- gen-025: adapt phase prompt 강화 완료. 3곳에 backlog 생성 금지 규칙 반영됨.
- 이 generation과 직접 관련은 없으나, prompt 관리 패턴 참고.

## CLAUDE.md 처리 케이스

| 상태 | 처리 |
|------|------|
| CLAUDE.md 없음 | 새로 생성 (`# {project}\n` + reap section) |
| CLAUDE.md 있고 reap 섹션 없음 | reap section append |
| CLAUDE.md 있고 reap 섹션 있음 | skip (이미 최신) |
| `.reap/` 없음 | 에러 — "reap 프로젝트가 아닙니다" |

## Context

- **Clarity**: High — goal이 구체적이고, 기존 코드에 이미 CLAUDE.md 처리 로직이 있어 재사용 가능
- **Type**: embryo
- **구현 범위**: `init --repair` 옵션 추가, repair 로직 구현, CLAUDE.md 보충, 테스트 작성
