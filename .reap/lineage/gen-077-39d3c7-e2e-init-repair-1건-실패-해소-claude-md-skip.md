---
id: gen-077-39d3c7
type: embryo
goal: "e2e init-repair 1건 실패 해소 — CLAUDE.md skip 판정 불일치 원인 규명 후 수정"
parents: ["gen-076-a3679b"]
---
# gen-077-39d3c7
**Goal**: e2e `init-repair` 1건 실패 해소. 6세대 방치된 항목이며 0.17.3 묶음의 첫 번째.

**결과**: 완료. **e2e 268-1 → 272-0.** gen-072 이래 처음으로 세 스위트가 모두 green.

**핵심 변경**:
- `tests/e2e/init-repair.test.ts` — 1 case → 4 case (marker / legacy heading / 참조만 / 반복)
- `src/cli/commands/init/repair.ts` — **`"updated"` 오분류 수정** (계획 밖 발견)
- `init/common.ts` + `core/integrity.ts` — 판정 비대칭이 의도임을 상호 참조 주석

**검증**: typecheck 0 / build / 문서 게이트 pass / unit 470-0 / e2e **272-0** / scenario 44-0