---
id: gen-020-bf05c1
type: embryo
goal: "install-skills에서 기존 reap/reapdev 스킬 정리 후 설치하도록 개선"
parents: ["gen-019-9ec1a6"]
---
# gen-020-bf05c1
`installSkills()`에 stale 스킬 파일 cleanup 로직을 추가. 새 스킬 복사 전에 `~/.claude/commands/`에서 `reap.*.md` + `reapdev.*.md` 패턴의 기존 파일을 삭제하여, 이름 변경/삭제된 스킬이 남지 않도록 개선.

### Changes
- `src/adapters/claude-code/install.ts`: `cleanupStaleSkills()` 함수 추가, `SKILL_PATTERN` 정규식, `emitOutput`에 cleaned 필드
- `tests/unit/install-skills.test.ts`: 9 unit tests 신규 작성
- `package.json`: build 스크립트에 `rm -rf dist/adapters/claude-code/skills` 추가 (stale dist artifact 방지)

### Test Results
- 182 tests 전체 통과 (unit 69 + e2e 72 + scenario 41)