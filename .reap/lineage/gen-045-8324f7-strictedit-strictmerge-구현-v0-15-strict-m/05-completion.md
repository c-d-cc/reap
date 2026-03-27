# Completion — gen-045-8324f7

## Summary

v0.15의 strict mode를 v0.16에 이식했다. `config.yml`의 단일 `strict: boolean` 필드를 `strictEdit: boolean`, `strictMerge: boolean`으로 분리하고, `buildBasePrompt()`에서 HARD-GATE 섹션으로 주입하는 enforce 로직을 구현했다.

### 주요 변경
- `src/types/index.ts`: ReapConfig 타입에서 strict 필드 분리
- `src/core/prompt.ts`: `buildStrictSection()` 신규 + `buildBasePrompt()` signature 확장
- `src/cli/commands/run/evolve.ts`: config 전달
- `src/cli/commands/init/common.ts`: 기본값 변경
- `src/cli/commands/update.ts`: legacy strict 자동 변환
- `src/cli/commands/migrate.ts`: v0.15 strict 변환
- `src/core/integrity.ts`: 새 필드 검증 + legacy 필드 경고
- `tests/unit/prompt-strict.test.ts`: 17개 신규 테스트

테스트: 452 pass (기존 435 + 17 신규)

## Lessons Learned

- v0.15 코드 참조가 이식 속도를 크게 높인다. `buildStrictSection()`의 HARD-GATE 텍스트와 분기 로직을 거의 그대로 가져올 수 있었다.
- `buildBasePrompt()`의 optional config 파라미터 추가 방식이 기존 호출 사이트의 변경을 최소화했다. 기존 테스트가 config 없이 호출해도 정상 동작.

## Next Generation Hints

- update 명령의 strict 변환 로직에 대한 e2e 테스트가 아직 없다. `strict: true`인 config.yml에 `reap update`를 실행했을 때 `strictEdit: true, strictMerge: true`로 변환되는지 e2e로 검증하면 좋겠다.
- skill 파일(.md)에 strict mode 관련 안내를 추가할 수 있다. 현재는 prompt 주입만 구현했고, 유저가 `/reap.config`로 strict mode를 켜는 방법에 대한 가이드는 없다.
