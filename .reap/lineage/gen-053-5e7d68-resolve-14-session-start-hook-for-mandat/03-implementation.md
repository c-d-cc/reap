# Implementation Log

## Completed Tasks

### T001: `src/cli/commands/load-context.ts` (신규)
- `buildKnowledgeContext(cwd)`: REAP 프로젝트 감지 (`.reap/config.yml` 존재 확인) 후, 모든 mandatory knowledge 파일을 병렬 읽기하여 단일 context 문자열로 조합.
- `execute()`: CLI 진입점. `buildKnowledgeContext` 결과를 `hookSpecificOutput.additionalContext` JSON 형식으로 stdout 출력. 비-REAP 디렉토리에서는 silent exit (코드 0, 출력 없음).
- 주입 대상: reap-guide, genome 3종, environment/summary, vision/goals, memory 3종, generation state, strict mode, language.
- 각 파일이 자체 markdown header를 갖고 있으므로 중복 header 없이 `---` 구분자로 연결.
- `buildKnowledgeContext`를 export하여 unit test에서 직접 검증 가능하게 설계.

### T002: `src/cli/index.ts`
- `load-context` command 라우팅 추가. `loadContextExecute` import + `.command("load-context")` 등록.
- 기존 command들 (daemon 앞)에 삽입.

### T003: `src/adapters/claude-code/install.ts`
- `registerCleanupHook()` → `registerSessionHooks()`로 리팩토링.
- 기존 `reap check-version` hook 유지 + 새 `reap load-context` hook 추가 등록.
- `requiredHooks` 배열 패턴으로 확장성 확보 (향후 hook 추가 시 배열에 항목만 추가).
- idempotent: 이미 등록된 hook은 skip.

### T004: `CLAUDE.md`
- 기존 파일 목록 나열 방식 → "Session-start hook이 자동 주입" 안내로 간소화.
- "Manual Reference (fallback)" 섹션에 파일 목록 유지 (hook 미실행/context compact 대비).
- Korean → English로 전환 (genome evolution.md의 "Source code is in English" 원칙 반영).

### T005: `.claude/CLAUDE.md`
- 기존 내용 유지 (이미 적절한 설명). 변경 없음.

### T006: `src/templates/claude-md-section.md`
- CLAUDE.md와 동기화. 자동 주입 안내 + fallback 파일 목록으로 업데이트.

### T007: `tests/unit/load-context.test.ts` (신규)
- 8개 테스트 케이스:
  1. 비-REAP 디렉토리 → null 반환
  2. .reap 존재하나 config.yml 없음 → null 반환
  3. 완전한 REAP 프로젝트 → 모든 knowledge 포함된 context 반환
  4. current.yml 존재 시 generation state 포함
  5. config의 language 설정 반영
  6. strictEdit=true 시 strict mode 섹션 포함
  7. current.yml 없을 때 "No active generation" 표시
  8. optional 파일 누락 시 graceful 처리

## Architecture Decisions

### emitOutput 미사용
`load-context`는 Claude Code hook으로 실행되므로, REAP의 표준 `emitOutput` (JSON + process.exit(0)) 대신 직접 `process.stdout.write` + `process.exit(0)`를 사용. 이유: `emitOutput`은 `ReapOutput` 형식을 강제하지만, hook 출력은 `hookSpecificOutput` 형식이어야 함. 또한 `emitOutput`의 `never` return type은 non-REAP 디렉토리에서의 silent exit 분기와 호환되지 않음.

### v0.15 대비 간소화
v0.15의 session-start.cjs는 version check, auto-update, staleness check, genome budget 관리, session init display 등을 모두 하나의 스크립트에서 처리했으나, v0.16에서는 관심사 분리:
- `check-version`: auto-update + legacy cleanup (기존)
- `load-context`: knowledge injection (신규)
