---
id: gen-036-3a6158
type: embryo
goal: "reap migrate — v0.15→v0.16 마이그레이션 구현"
parents: ["gen-035-45b5c5"]
---
# gen-036-3a6158
v0.15→v0.16 마이그레이션 기능 구현 완료. `reap init --migrate` 명령으로 multi-phase migration 핑퐁 구조를 구현했다.

주요 변경:
- **신규 파일 4개**: migrate.ts (핵심 로직 ~400 lines), check-version.ts, reap.migrate.md 스킬, migrate.test.ts (20 tests)
- **수정 파일 11개**: CLI 진입점 7개에 v0.15 gate 추가, init 분기 추가, CLI 옵션 등록, postinstall 확장
- **총 330 tests 통과** (기존 310 + 신규 20)