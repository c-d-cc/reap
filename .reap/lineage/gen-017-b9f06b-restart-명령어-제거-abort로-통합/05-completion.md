# Completion — gen-017-b9f06b

## Summary

restart 명령어를 완전히 제거하고 abort로 통합 완료. 삭제 2파일(restart.ts, reap.restart.md), 수정 2파일(run/index.ts, maturity.ts), environment 업데이트(summary.md에서 restart.ts 제거, handler 수 19→18).

### Changes
- `src/cli/commands/run/restart.ts` — 삭제
- `src/adapters/claude-code/skills/reap.restart.md` — 삭제
- `src/cli/commands/run/index.ts` — restart import/handler/주석 제거
- `src/core/maturity.ts` — "Restart frequency" → "Abort frequency"
- `.reap/environment/summary.md` — restart.ts 제거, handler 수 수정, 테스트 설명 업데이트

### Validation: PASS (typecheck, build, unit 55/55, e2e 63/63 = 118 tests)

## Lessons Learned

- restart와 abort의 기능 중복은 코드 분석으로 명확히 확인됨. 두 명령어의 차이는 "abort 후 새 generation 생성"뿐이었고, 이는 사용자가 abort + start로 충분히 대체 가능.
- 테스트에 restart 참조가 없어서 테스트 수정이 불필요했음. 잘 분리된 테스트 구조의 이점.

## Next Generation Hints

- 이번 변경으로 skill 파일이 18→17개로 감소. install-skills 명령은 파일 목록 기반이므로 자동 반영됨.
