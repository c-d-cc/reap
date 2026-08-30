# handoff — ms-012

**12.1·12.2·12.3 전부 됐다** (`gen-0047`·`gen-0048`). 남은 것은 종료 조건 9의 "새 세션에서 `loop` skill 확인"과 fitness.

- 도구: `make loop`·`mark loop`(10개 규칙)·`--plan` 거부·상태 줄 — 테스트 `tests/loop.test.ts`
- skill: `plugin/skills/loop/SKILL.md`. `interview`를 가리키는데 아직 없다(`ms-007`)
- 이 리포의 두 번째 loop(`loop-0002-idea`)는 도구 검증용으로 열고 abort했다. **실제 두 번째 loop는 `ms-007`의 `init`이 될 것이다**

걸려 있는 것: fitness 2·3·4는 실사용 뒤에만 답이 나온다.

cleanup: `gen-0044`·`gen-0045`(내용이 `02-flow.md`와 `loop-0001`에 반영됨)·`gen-0047`·`gen-0048`(도구와 skill이 그 결과다)을 archive로. `gen-0046`(init 설계)은 `ms-007`이 읽으므로 남긴다.
