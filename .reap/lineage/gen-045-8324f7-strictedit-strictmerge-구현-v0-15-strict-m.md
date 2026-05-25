---
id: gen-045-8324f7
type: embryo
goal: "strictEdit/strictMerge 구현 — v0.15 strict mode 이식"
parents: ["gen-044-d155b0"]
---
# gen-045-8324f7
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