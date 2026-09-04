---
id: loop-0004-plan
slug: v018-release
type: plan
title: v0.18 완성과 출시 — v0.17 대조·공백 보충·이주·배포
from: ps-4b485d:README.md
startedAt: 2026-09-03T14:25:26Z
startCommit: 71d5681
status: open
milestones: []
---
## Question

ps-4b485d(귀환 작전)는 "배포 전까지"에서 끝났다. 이 loop는 그 다음 — **v0.18을 완성해 내보내는 길**을 정한다. 사람은 2026-09-03에 개발 완료 판단까지의 결정을 전부 agent에게 위임했다(승인 생략). 답할 것 넷:

① **v0.17 대조** — 0.17 사용자가 일상적으로 쓰던 것 중 v0.18에 자리가 없는 것은 무엇이고, 그중 무엇을 만들고 무엇을 "안 만든다"로 확정하는가. 08-delivery의 폐기 표와 gen-0066 판정 6건은 유지한다.
② **이주 후 사용성** — 이주한 프로젝트가 v0.18에서 실제로 돌아가는가(migrate skill 재검증 + upgrade agent 왕복).
③ **배포 형태** — 0.17.8 다리는 `npm i -g @c-d-cc/reap@next`를 전제하는데 v0.18 package.json은 `reap 0.1.0 private`이고 엔트리가 Bun 전용이다. 이 모순을 어느 쪽으로 푸는가.
④ **출시 준비물** — README·릴리스 노트·버전·마켓플레이스(`c-d-cc/plugins`의 reap2→reap)·0.17.8 발행 순서. 실제 push·publish는 사람의 결정으로 남긴다.

## Explored

- **v0.18 현재**: 테스트 172 통과 · doctor 결함 0 · CLI 20계열(`init·make·mark·bind·seq·carrier·doctor·index·orch·plan·ctx`) · skill 10종(spec 9 + migrate) · README 없음 · `package.json`은 `reap 0.1.0 private`, bin이 `src/cli.ts`(Bun 필요)
- **node 번들 probe** (2026-09-03): `bun build --target=node --outdir`로 233KB cli.js + wasm 15개가 나온다. node로 `--version`은 돈다. 막히는 것 셋뿐 — `Bun.YAML`(plan.ts) · `Bun.sleep`(orch.ts) · wasm 경로가 cwd 상대(`type: "file"` 임포트). 즉 npm 배포는 작은 수정으로 열린다
- **0.17.8 다리** (`~/cdws/reap_v17`, 브랜치 v0.17, origin과 동기): 일일 캐시·`next` 안내·`reap update`가 upgrade agent를 `raw.githubusercontent.com/c-d-cc/reap/main/docs/upgrade-agent/reap-upgrade.md`에서 받아 `~/.claude/agents/`에 설치. **아직 0.17.8로 bump 안 됨**(package.json 0.17.7). upgrade agent 본문은 "npm i -g @next → 플러그인 설치(README 따라) → /reap:migrate"
- **npm 현재**: latest 0.17.7, alpha 0.16.0-alpha, `next` 없음
- **마켓플레이스**: `c-d-cc/plugins`(~/cdws/ctod-plugins)는 submodule `plugins/reap2`(c-d-cc/reap2)를 `reap2` 이름으로 싣고 있다. v0.18 plugin.json의 name은 `reap`. 개발 마켓플레이스 `reap2-dev`는 `~/cdws/reap2/plugin`(구 개발 리포)을 가리킨다 — reap 리포의 `plugin/`을 가리키지 않는다
- **개발 리포 reap2**: src·plugin이 이 브랜치와 동일(migrate skill만 여기에만 있음). 68커밋 미푸시. PATH의 `reap`는 reap2/dist/reap이다. **이 loop부터는 reap 리포 v0.18이 정본이고 reap2는 더 갱신하지 않는다**
- **v0.18 hooks**: `.reap/hooks/`는 init이 만들지만 비어 있고 `make hook`도 이벤트 발화도 없다(07-orchestrate "아직 아니다"). v0.17은 hooks 기제가 있었다 — 대조 항목

## Dialogue

| 갈린 지점 | 선택지 | 답 | 비고 |
|---|---|---|---|
| 계획을 어디에 쓰나 | ps-4b485d 확장 / 새 세트 | **새 세트 ps-5e948f** | bk-bb11a1의 판정을 손으로. ps-4b485d는 소비 완료 |
| 0.18.0 배포 채널 | 바이너리(brew/curl, spec) / npm(다리 전제) | **npm 먼저, 바이너리는 뒤** — 순서지 방향 전환 아님 | 위임 하 agent 판정. 02-distribution |
| hooks를 만드나 | spec 07 "아직" / 사람 2026-09-01 "제공" | **만든다** — spec 07 갱신 포함 | 사람 결정 승계 |
| 방향 질문 5건(사이트·언어·테스트 공개·subagent 실행자·reap2 처분) | — | **실행하지 않고 05-open으로 올림** | 사람 검토 대기 (2026-09-03 지시) |

## Outcome (진행 중)

- plan source **ps-5e948f** (`docs/reap-plan/reap_v_0_18_release/`, README + 01~06)
- **ms-016**(배포 패키지, focus) · **ms-017**(hooks) · **ms-018**(이주 보강·문서) · **ms-019**(왕복 검증·발행 준비) 잘림. 016·017 병렬
| 방향 질문 5건 답 (사람, 2026-09-04) | 05-open 각 2~3안 | **Q1 새 사이트(ko 먼저, 검수 뒤 확장) · Q2 B(en 기본, ko 층) · Q3 B(reap-test submodule) · Q4 B(evolve 위임 모드) · Q5 A(마켓플레이스 reap, reap2 archive)** | Q1·Q2·Q3는 추천과 다른 답, Q4·Q5는 추천 밖/채택. 발행은 추후 지시 |
- **2026-09-04 진행**: ms-016·017·018·020·021 닫힘. ms-019는 task 1~4 완료, task 5(최종 재검증) 남음. ms-022(사이트 ko 열두 쪽)는 사람 검수 대기, ms-023(tests submodule)은 task 2 진행 중. 발행은 사람 지시 대기. 위임 모드(brief 템플릿)로 gen-0087~0091이 돌았다

## Outcome (2026-09-04, 개발 완료 시점)

- 닫힌 milestone: ms-016(npm 패키지·워크플로) · ms-017(hooks) · ms-018(이주 보강·문서) · ms-019(왕복 검증·0.17.8·마켓플레이스·최종 재검증) · ms-020(evolve 위임 모드) · ms-021(en 전환·ko 카탈로그) · ms-023(tests submodule). 세대 gen-0076~0092
- 열린 것: **ms-022**(사이트 ko 열두 쪽 — 사람 검수 → en 확장). 발행은 사람 지시 — 절차는 `archive/milestones/ms-019-v018-verify-release/handoff.md`
- 이 loop는 ms-022가 닫힐 때 닫는다. ps-5e948f는 0.18.0 발행 뒤 소비 완료
