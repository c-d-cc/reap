---
id: gen-054-f931e1
type: embryo
goal: "resolve: CLAUDE.md REAP section template sync on reap update"
parents: ["gen-053-5e7d68"]
---
# gen-054-f931e1
Goal: `reap update` 시 CLAUDE.md의 REAP 섹션이 템플릿 변경을 자동 반영하도록 마커 기반 동기화 구현.

변경 사항:
- `src/cli/commands/init/common.ts`: `ensureClaudeMd()` 리팩토링 -- `<!-- reap:start {hash} -->` / `<!-- reap:end -->` 마커 기반 변경 감지/교체. 반환값에 "updated" 추가. 레거시 하위 호환.
- `src/cli/commands/update.ts`: "updated" 반환값 처리
- `src/cli/commands/fix.ts`: 마커 기반 감지로 변경 (기존 문자열 감지 제���)
- `CLAUDE.md`: dogfooding 마커 적용
- `tests/unit/claude-md-sync.test.ts`: 신규 12개 unit test

결과: 전체 completion criteria 충족. 332 pass / 4 fail (pre-existing).