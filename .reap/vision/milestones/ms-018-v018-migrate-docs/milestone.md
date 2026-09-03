---
id: ms-018
slug: v018-migrate-docs
title: 이주 보강과 사용자 문서 — environment·hooks 매핑, ctx 언어, README, 릴리스 노트
from: loop-0004-plan
refs:
  - ps-5e948f:04-migrate-docs.md
status: open
openedAt: 2026-09-03T14:40:21Z
focus: true
---
## Background

이주 매핑에 `environment/`가 없고(gen-0073 실물이 못 잡음), hooks 판정이 ms-017로 뒤집혔고, upgrade agent가 가리키는 README가 없다. `ctx`가 language를 읽지 않는다. [04-migrate-docs.md](../../../../docs/reap-plan/reap_v_0_18_release/04-migrate-docs.md).

## Exit Criteria

- migration-map에 environment/ 매핑(summary·source-map·resources·domain·docs)과 hooks 매핑(2종 대응, 나머지 "대응 없음")이 있고, 실물 표본(gen-0073의 `scratchpad/migration-specimen` 또는 `~/cdws/reap_v17/.reap`)으로 다시 돌려 environment/·hooks가 실제로 옮겨지고 기록 파일에 적힌다
- `reap ctx`가 `config.language`가 있으면 "응답 언어: <code>" 한 줄을 상태 줄 앞에 낸다. 없으면 안 낸다. hook.test.sh·ctx.test.ts 초록
- `README.md`가 04-migrate-docs의 7절을 담고, upgrade agent 3단계·migrate 8/8·README가 같은 설치 명령을 말한다
- `RELEASE_NOTES.md`에 0.18.0 절
- 05-open Q1·Q2의 답이 와 있으면 반영, 안 왔으면 README가 한국어 하나이고 그 사실을 handoff에 남긴다

## Out of Scope

- 문서 사이트 (Q1)
- 영어 README (Q2가 A면 한 절만)
- 0.17.8 쪽 노트·bump — ms-019

## Plan Items

1. migration-map 보강 + detect 스크립트 정합 + 실물 재검증 (tasks/1)
2. ctx 언어 줄 (tasks/2 — 작다, 1과 같은 세대 가능)
3. README + RELEASE_NOTES 0.18.0 (tasks/3)

## 이 milestone이 끝나면 물어볼 것

- README만 읽고 Bun·REAP를 모르는 사람이 설치→첫 세대까지 갔는가
- 이주 기록 파일이 "무엇을 잃었는가"를 사용자가 납득할 만큼 말하는가
