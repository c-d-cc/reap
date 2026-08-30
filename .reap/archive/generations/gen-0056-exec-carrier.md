---
id: gen-0056-exec
slug: carrier
type: exec
milestone: ms-006
title: carrier — 표식 발급과 조회
startedAt: 2026-08-30T16:50:07Z
startCommit: d180c58
status: closed
closedAt: 2026-08-30T16:51:52Z
endCommit: 6989c69
---
## Intent

`ms-006` 6.2 `carrier`. 그리고 Open Question "표식을 이 리포에 실제로 심을 것인가"에 답한다.

## Outcome

- `src/carrier.ts` — `scanCarriers`(리포를 훑어 id별로 자리를 모은다. 산문의 `<hash6>` 꺾쇠는 hex가 아니라 안 걸린다), `newCarrier`(미사용 해시, **같은 slug가 이미 있으면 거부** — 한 slug에 해시 둘이 생기는 길을 막는다, 아무것도 쓰지 않는다), `checkCarriers`(형식·한 해시에 slug 둘·한 slug에 해시 둘), `orphans`(한 파일에만). 파일 목록은 `git ls-files --cached --others --exclude-standard`, git이 아니면 걷는다
- `reap carrier new <slug> | list [--orphans|--check]`. 테스트 5개, 148 통과
- **표식을 심었다** — `map-seed`. `.reap/map.md`·`src/templates/map.md`·`store.ts`의 `SEEDS`가 같은 사실(레이아웃)을 안다. `carrier list`가 셋을 낸다, `--check` 깨끗, 고아 없음. Open Question이 후보로 든 바로 그것이다

## Notes

`init --check`는 `map.md`와 템플릿을 바이트 비교하므로 표식을 양쪽에 똑같이 넣었다 — 여전히 같다.
