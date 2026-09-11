---
id: gen-0115-exec
slug: loop-to-flux
type: exec
backlog: bk-d1dbfb
title: loop을 flux로 — id·저장·명령·skill·spec·문서·데이터 전부
startedAt: 2026-09-11T21:28:38Z
startCommit: 64d66b7
status: closed
closedAt: 2026-09-11T21:51:31Z
endCommit: cbcbbe1
---

## Intent

`bk-d1dbfb`. `loop`이라는 이름을 `flux`로 바꾼다. **하위 호환을 두지 않는다** — 0.18은 공개 전이고, 별칭을 남기면 그것이 곧 두 이름이 공존하는 상태다.

끝나는 조건 — 리포 어디에도 REAP의 단위를 뜻하는 `loop`이 없다. `reap make flux`·`reap mark flux`가 돌고, 기록은 `life/flux/<flux-id>-<slug>.md`에 놓이며, 이 리포의 기존 기록 셋과 그것을 가리키는 참조가 전부 옮겨져 `reap doctor` 결함 0이다. 그리고 다른 프로젝트에서 한 번 돌릴 `loop-to-flux` 스킬이 있다.

## References

- `.reap/life/backlog/bk-d1dbfb-loop-to-flux.md` — 왜와 범위(실측)
- `bk-5baff2` ralph — `loop`이라는 낱말을 비워야 하는 이유
- `scripts/cleanup-home.mjs` — 되돌릴 수 없는 일의 선례(목록 → 동의 → `--apply`)

## Outcome

`loop`이 `flux`가 됐다. 리포 어디에도 REAP의 단위를 뜻하는 옛 이름이 없고, 그것을 **검사가 지킨다**.

- 코드 — `id.ts`(Kind·접두어·레지스트리) · `store.ts`(경로) · `doc.ts` · `entries.ts` · `ctx.ts` · `doctor.ts` · `cli.ts` · 템플릿 · 메시지 en·ko
- 저장 — `life/flux/` · `archive/flux/` · `sequence/flux.md`
- skill — `plugin/skills/flux/`와 참조하는 일곱, 기록 어휘
- spec — `ps-4f2a91` 일곱 문서. `02-flow.md`의 정의 자리에 **왜 바꿨는지**를 적었다
- 문서 — 사이트(`FluxPage`·`/docs/flux`·라우트·사이드바·번역) · README 둘 · 릴리스 노트 en·ko
- 이 리포의 데이터 — 기록 셋·레지스트리·참조. **손으로 하지 않고 `loop-to-flux` 스크립트로 옮겼다**
- `scripts/check-freed-words.sh` — 비워둔 낱말이 돌아왔는지 보는 게이트

검사: `bun test` 243 · `tsc`(루트·site) · 셸 스위트 셋 · 문서 게이트 · **낱말 게이트** · 사이트 빌드 29쪽 · prerender 6 · `reap doctor` 결함 0.

`life/flux/`인가 `life/fluxes/`인가 하는 물음은 **`flux`로 갔다** — `backlog`처럼 불가산으로 읽었고, 실제로 써 보니 어긋나지 않았다.

summary.md: **갱신** — `life/`·`archive/` 줄, skill 목록, 명령 목록. 겸사겸사 원래부터 틀렸던 "`plan/` 아래에 단위 기록이 산다"도 고쳤다. genome: 해당 없음(`evolution.md`는 낱말만 바뀌었다).

## Dead Ends

**일괄 치환을 믿었다가 두 번 틀렸다.** 이 세대의 가장 큰 교훈이고 둘 다 사람과 검증이 잡았다.

**첫째 — 훑는 범위를 좁게 잡았다.** 디렉토리를 지정하고 예외까지 걸어 훑고는 "끝났다"고 했다. 사람이 *"레포 전체에서 loop 를 찾아보아라 대소문자 구분 없이. 아직 꽤 나온다"*고 해서 79곳이 드러났다. 그중 최악은 `environment/summary.md` — **매 세션 주입되는데 없는 명령을 가르치고 있었다.** `docs/reap-plan/`(등록된 plan source 둘)은 대상에 아예 없었다.

그 안에 더 조용한 것이 하나 있었다. **한글 파일명이 `git ls-files`에서 8진수로 나와 아홉 파일을 말없이 건너뛰었다.** `lessons.md:130`에 이미 적혀 있는 함정을 그대로 밟았다. `-z`로 받아야 한다.

**둘째 — 치환이 이 변경 자체를 설명하던 문장을 망가뜨렸다.** "`flux`은 순환을 뜻한다", "`flux을 flux로`", "`plan/flux/` → `life/flux/`", "*ralph flux*". 옛 이름을 불러야 하는 자리가 있다 — 개명의 근거, 이주 스킬, 그리고 **외부 고유명사**(ralph loop).

**그래서 게이트를 만들었다.** 검사 243개가 전부 초록인 채로 79곳이 남아 있었다는 것이 핵심이다. `check-docs-surface`는 이름이 **언급되는지**만 보지 낡은 낱말로 설명되는 것은 못 본다. `check-freed-words.sh`가 그 자리를 메운다 — 허용 목록에 근거를 적게 해서, 예외를 늘리는 것이 눈에 띄게 했다.

**이주 스크립트를 먼저 여기서 돌린 것은 맞았다.** 그 한 번이 결함 넷을 드러냈다 — `--root <경로>`를 무시하고 cwd를 옮기던 것(스크립트가 REAP 리포 안에 사니 REAP 자신을 옮길 뻔했다), 유형 없는 `loop-0003` 꼴을 놓치던 정규식, `.gitkeep`만 남은 디렉토리를 못 치우던 것, 조사.

**`doctor`가 이주 여부를 증명해 주지 않는다는 것도 이때 드러났다.** 이주 안 된 프로젝트도 결함 0이다 — 옛 id가 id 형식이 아니라 끊긴 참조로 세지도 않는다. SKILL.md가 그 반대로 적고 있었다. 고쳤고 `bk-a1eb4e`로 남겼다.

