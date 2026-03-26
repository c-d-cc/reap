# Completion — gen-020-bf05c1

## Summary

`installSkills()`에 stale 스킬 파일 cleanup 로직을 추가. 새 스킬 복사 전에 `~/.claude/commands/`에서 `reap.*.md` + `reapdev.*.md` 패턴의 기존 파일을 삭제하여, 이름 변경/삭제된 스킬이 남지 않도록 개선.

### Changes
- `src/adapters/claude-code/install.ts`: `cleanupStaleSkills()` 함수 추가, `SKILL_PATTERN` 정규식, `emitOutput`에 cleaned 필드
- `tests/unit/install-skills.test.ts`: 9 unit tests 신규 작성
- `package.json`: build 스크립트에 `rm -rf dist/adapters/claude-code/skills` 추가 (stale dist artifact 방지)

### Test Results
- 182 tests 전체 통과 (unit 69 + e2e 72 + scenario 41)

## Lessons Learned

- 단순한 파일 복사 함수도 lifecycle을 고려하면 cleanup이 필요하다. "설치"는 "이전 상태 정리 → 새 상태 적용"이 올바른 패턴.
- 정규식 패턴으로 파일을 필터링할 때, bare prefix (reap.md)가 매칭되지 않도록 `.+` 조건이 중요하다.
