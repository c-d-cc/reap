---
id: gen-0115-exec
slug: loop-to-flux
type: exec
backlog: bk-d1dbfb
title: loop을 flux로 — id·저장·명령·skill·spec·문서·데이터 전부
startedAt: 2026-09-11T21:28:38Z
startCommit: 64d66b7
status: open
---

## Intent

`bk-d1dbfb`. `loop`이라는 이름을 `flux`로 바꾼다. **하위 호환을 두지 않는다** — 0.18은 공개 전이고, 별칭을 남기면 그것이 곧 두 이름이 공존하는 상태다.

끝나는 조건 — 리포 어디에도 REAP의 단위를 뜻하는 `loop`이 없다. `reap make flux`·`reap mark flux`가 돌고, 기록은 `life/flux/<flux-id>-<slug>.md`에 놓이며, 이 리포의 기존 기록 셋과 그것을 가리키는 참조가 전부 옮겨져 `reap doctor` 결함 0이다. 그리고 다른 프로젝트에서 한 번 돌릴 `loop-to-flux` 스킬이 있다.

## References

- `.reap/life/backlog/bk-d1dbfb-loop-to-flux.md` — 왜와 범위(실측)
- `bk-5baff2` ralph — `loop`이라는 낱말을 비워야 하는 이유
- `scripts/cleanup-home.mjs` — 되돌릴 수 없는 일의 선례(목록 → 동의 → `--apply`)

## Working Plan

낱말이 두 뜻으로 쓰이므로 **기계적 치환을 한 번에 돌리지 않는다.** 층마다 확인하며 내려간다.

1. 검사를 먼저 — `tests/loop.test.ts` → `flux.test.ts`, 이름을 바꾸고 돌려 실패를 확인
2. 코드 — `id.ts`(Kind·접두어·레지스트리) → `store.ts`(경로) → `doc.ts` → `entries.ts` → `ctx.ts`·`doctor.ts` → `cli.ts` → 메시지 en·ko
3. 템플릿 — `loop.md` → `flux.md`, `map.md` 씨앗
4. skill — `plugin/skills/loop/` → `flux/`, 참조하는 일곱
5. spec — `ps-4f2a91` 여섯 문서
6. 문서 — 사이트 ko, README 둘, 릴리스 노트
7. 이 리포의 데이터 — 기록 셋·레지스트리·`from:` 참조. **손으로 하지 않고 4에서 만들 스킬의 스크립트로 한다** — 그것이 곧 그 스크립트의 첫 검증이다
8. `loop-to-flux` 스킬 — 배포하지 않는다. `.claude/skills/`에 둔다

## Open Questions

- `life/flux/` → `life/flux/`인가 `life/fluxes/`인가. 이웃은 `generations`·`milestones`(복수)와 `backlog`(불가산)다. **`flux`는 불가산으로 읽어 `backlog`를 따른다**로 정하고 시작한다 — 어긋나면 되돌린다
