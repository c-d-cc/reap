# Planning — gen-020-bf05c1

## Goal

`installSkills()`에서 새 스킬 복사 전에 기존 `reap.*.md` + `reapdev.*.md` 파일을 정리하여, 이름 변경/삭제된 스킬의 stale 파일이 남지 않도록 개선한다.

## Completion Criteria

1. `installSkills()` 실행 시 `~/.claude/commands/`에서 `reap.*.md` + `reapdev.*.md` 패턴의 기존 파일이 삭제된다
2. 삭제 후 새 스킬 파일이 정상적으로 복사된다
3. 삭제된 파일 수와 설치된 파일 수가 JSON output에 포함된다
4. 타겟 디렉토리가 없거나 비어있어도 에러 없이 동작한다
5. `reap.*.md` / `reapdev.*.md`가 아닌 다른 파일은 영향받지 않는다
6. unit test가 cleanup 로직을 검증한다

## Approach

- `installSkills()` 함수 내에서 `ensureDir` 이후, 스킬 복사 이전에 cleanup 단계를 추가
- `readdir`로 타겟 디렉토리 스캔 → 정규식 `/^(reap|reapdev)\..+\.md$/`로 매칭 → `unlink`로 삭제
- 기존 `emitOutput`에 `cleaned` 필드 추가하여 삭제된 파일 수를 보고

## Scope

### 변경 대상
- `src/adapters/claude-code/install.ts` — cleanup 로직 추가

### 신규 생성
- `tests/unit/install-skills.test.ts` — unit test

### 범위 외
- CLI 커맨드 (`install-skills.ts`) — 변경 불필요
- 스킬 파일 자체 — 변경 없음

## Tasks

- [ ] T001 `src/adapters/claude-code/install.ts` — cleanup 함수 추가: `readdir` → 정규식 필터 → `unlink`
- [ ] T002 `src/adapters/claude-code/install.ts` — `installSkills()`에 cleanup 호출 삽입 (ensureDir 이후, cp 이전)
- [ ] T003 `src/adapters/claude-code/install.ts` — `emitOutput`에 cleaned 정보 추가
- [ ] T004 `tests/unit/install-skills.test.ts` — unit test 작성 (stale 파일 삭제 검증, 비관련 파일 보존 검증, 빈 디렉토리 검증)
- [ ] T005 빌드 및 전체 테스트 실행으로 검증
