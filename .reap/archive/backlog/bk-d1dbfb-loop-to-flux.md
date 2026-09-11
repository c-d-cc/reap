---
id: bk-d1dbfb
slug: loop-to-flux
type: breaking
title: loop을 flux로 바꾼다 — 이름이 순환을 뜻해 기획이라는 실제 일과 어긋난다
createdAt: 2026-09-11T21:27:30Z
status: consumed
consumedBy: gen-0115-exec
---

## 왜

`loop`은 **명시적인 순환**을 뜻한다. 그런데 그 단위가 실제로 하는 일은 **plan을 증진해 기획을 만드는 것**이다. 이름이 일을 잘못 가리켜 오해의 소지가 있었다(사람 판단 2026-09-12).

`flux`는 **흐름을 만들어낸다**는 뜻으로 고른 것이다. 그리고 `loop`이라는 낱말은 비워 둬야 한다 — `bk-5baff2`의 ralph가 그 낱말을 **진짜 무한 루프**의 뜻으로 쓸 것이기 때문이다. 남겨두면 두 뜻이 한 리포에서 부딪힌다.

## 파괴적으로 바꾼다

0.18은 아직 공개 전이고 소비자가 없다. 하위 호환을 두지 않는다 — 별칭도, 옛 이름 인식도 남기지 않는다. 남기면 그것이 곧 두 이름이 공존하는 상태다.

## 범위 (실측 2026-09-12)

| 층 | 무엇 |
|---|---|
| id | `loop-NNNN-<type>` → `flux-NNNN-<type>`. `Kind`의 `"loop"` → `"flux"`, 레지스트리 `sequence/loop.md` → `sequence/flux.md` |
| 저장 | `life/loops/` → `life/flux/`, `archive/loops/` → `archive/flux/` |
| 명령 | `make loop` → `make flux`, `mark loop` → `mark flux`. 유형 `plan\|design\|uiux\|idea`는 그대로 |
| 코드 | `id.ts`(24) · `entries.ts`(20) · `cli.ts`(15) · `store.ts`(10) · `ctx.ts`(10) · `doc.ts`(6) · `doctor.ts`(3) · `templates.ts`(4) · 메시지 en·ko(32) |
| skill | `plugin/skills/loop/` → `plugin/skills/flux/`. 참조하는 skill 일곱 — evolve(18)·init(12)·help(8)·carve-milestone(8)·interview(7)·report-issue(4)·complete(4)·record-vocabulary(4) |
| spec | `ps-4f2a91` 여섯 문서 — 02-flow(41)·06-agent(40)·03-storage(20)·04-commands(15)·05-knowledge(10)·09-roadmap(5) |
| 문서 | 사이트 ko(142) · README 둘 |
| 검사 | `tests/loop.test.ts`(102) → `flux.test.ts` · doctor·plan 테스트 |
| 이 리포의 데이터 | 기록 셋(`loop-0001`·`0003`·`0004`), 레지스트리 5행(`loop-0002-idea` 포함), `from:`으로 가리키는 milestone 10여 개 |

## 다른 프로젝트를 위한 일회용 스킬

**내부 프로젝트 하나가 0.18을 미리 쓰고 있다.** 거기 이미 만들어진 loop artifact를 flux로 옮길 **일회용 스킬 `loop-to-flux`**를 만든다.

- **배포하지 않는다** — 마켓플레이스에도 `plugin/skills/`에도 올리지 않는다. 사람이 직접 스킬을 지정해 그 프로젝트에서 한 번 돌린다
- 옮기는 것: `life/loops/`·`archive/loops/` 디렉토리와 파일 이름, 기록의 `id:` frontmatter, `sequence/loop.md`, 그것을 `from:`으로 가리키는 milestone·backlog·generation
- 되돌릴 수 없는 일이므로 **먼저 무엇을 바꿀지 보이고 사람의 동의를 받은 뒤** 적용한다. `scripts/cleanup-home.mjs`가 쓰는 모양(목록 → 동의 → `--apply`)이 선례다
