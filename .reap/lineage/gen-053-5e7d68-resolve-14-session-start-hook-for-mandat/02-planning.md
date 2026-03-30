# Planning — gen-053-5e7d68

## Goal

SessionStart hook에서 mandatory knowledge(genome, environment, vision, memory, reap-guide)를 자동으로 Claude Code system context에 주입하여, AI가 세션 시작 시 REAP 규칙을 항상 인지하도록 한다.

## Completion Criteria

1. `reap load-context` 실행 시 REAP 프로젝트에서 mandatory knowledge가 JSON stdout으로 출력됨
2. 비-REAP 디렉토리에서 `reap load-context` 실행 시 silent exit (출력 없음, exit 0)
3. `~/.claude/settings.json`의 SessionStart hook에 `reap load-context` 등록됨
4. 주입 내용에 genome 3종, environment/summary, reap-guide, vision/goals, memory 3종, generation state, strict mode, language 포함
5. CLAUDE.md가 자동 주입 안내로 간소화됨 (파일 목록 → 자동 로딩 안내 + 수동 재로딩 방법)
6. `src/templates/claude-md-section.md`이 CLAUDE.md와 동기화됨
7. 기존 테스트가 깨지지 않음
8. 신규 `load-context` command에 대한 unit test 작성

## Approach

v0.15의 `session-start.cjs` 패턴을 v0.16 아키텍처에 맞게 재구현:

- **독립 CLI command** (`reap load-context`): v0.16 패턴 준수 (command → execute function)
- **hookSpecificOutput.additionalContext**: Claude Code가 인식하는 JSON 형식으로 stdout 출력
- **REAP 프로젝트 감지**: `.reap/config.yml` 존재 여부로 판별
- **기존 코드 재활용**: `readTextFile()`, `buildStrictSection()`, `GenerationManager.current()`, `ReapPaths`

핵심 차이점:
- v0.15는 CJS 스크립트 직접 실행 → v0.16은 CLI command (`reap load-context`)
- v0.15는 genome L1/L2 budget 관리 → v0.16은 genome 3파일로 작아져서 전문 주입
- v0.16은 vision/memory 추가 주입 (v0.15에 없었음)

## Scope

### In Scope
- `src/cli/commands/load-context.ts` (신규)
- `src/cli/index.ts` (command 라우팅 추가)
- `src/adapters/claude-code/install.ts` (hook 등록 추가)
- `CLAUDE.md` (간소화)
- `.claude/CLAUDE.md` (설명 업데이트)
- `src/templates/claude-md-section.md` (dogfooding 동기화)
- `tests/unit/load-context.test.ts` (신규 테스트)

### Out of Scope
- reap-guide.md 내용 변경
- genome 파일 내용 변경
- check-version.ts 수정 (기존 로직 유지)

## Tasks

- [ ] T001 `src/cli/commands/load-context.ts` — 신규 command 생성. REAP 프로젝트 감지, knowledge 파일 읽기, generation state 파싱, strict mode 판단, hookSpecificOutput JSON stdout 출력. 테스트: unit test (T007)
- [ ] T002 `src/cli/index.ts` — `load-context` command 라우팅 추가. 테스트: 기존 e2e test 통과 확인
- [ ] T003 `src/adapters/claude-code/install.ts` — `registerSessionHook()` (rename from `registerCleanupHook`)에 `reap load-context` hook entry 추가. 기존 check-version hook 유지. 테스트: unit test (T007)
- [ ] T004 `CLAUDE.md` — 자동 로딩 안내로 간소화. "Session-start hook이 자동 로딩합니다. 재로딩 필요 시 `/reap.knowledge reload`". 테스트: 수동 검증
- [ ] T005 `.claude/CLAUDE.md` — 설명 업데이트 (context compact 시 재로딩 안내 추가). 테스트: 수동 검증
- [ ] T006 `src/templates/claude-md-section.md` — CLAUDE.md와 동기화. 테스트: 수동 검증
- [ ] T007 `tests/unit/load-context.test.ts` — load-context command의 핵심 로직 unit test. 테스트: bun test

## Dependencies

T001 → T002 (command가 있어야 라우팅 가능)
T001 → T003 (command가 있어야 hook 등록 의미)
T004, T005, T006은 독립적이나 T001 완료 후가 자연스러움
T007은 T001 완료 후
