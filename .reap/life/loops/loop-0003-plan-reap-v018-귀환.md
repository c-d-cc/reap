---
id: loop-0003-plan
slug: reap-v018-귀환
type: plan
title: reap v0.18 — reap의 제자리 찾기
refs:
  - ps-4f2a91:08-delivery.md
startedAt: 2026-08-30T22:48:35Z
startCommit: d7087b8
status: closed
milestones:
  - ms-013
  - ms-014
  - ms-015
closedAt: 2026-08-31T14:28:10Z
---
## Question

reap를 reap(~/cdws/reap)의 v0.18로 되돌려 넣는 길을 정한다. 배포 전까지의 셋 —
① reap 리포에 v0.18 브랜치를 어떻게 세우는가(자동 업데이트 차단 포함),
② 기존 reap 기능을 대조해 무엇을 가져가고 무엇을 버리는가,
③ v0.17 사용자를 위한 migration skill은 무엇을 하는가.
배포 자체는 이 loop의 범위 밖이다.

## Explored

- **reap 실물** (~/cdws/reap, v0.17.7): npm `@c-d-cc/reap`, CLI 21명령 + plugin(command 19·agent 2·hook), `.reap/` 저장, 5단계 lifecycle. main과 1커밋 차이인 `feat/plugin-distribution` 브랜치에 gen-101(plugin 전환)이 이미 커밋돼 있고 작업 트리에 미커밋 수정 둘
- **자동 업데이트 기제**: SessionStart 훅 → `reap check-version` → `npm view @c-d-cc/reap version`(latest)과 `reap.autoUpdateMinVersion`(floor, latest의 metadata에서 읽음) → 전역 설치 + 신버전 + floor 통과 + `autoUpdate!=false`면 `npm install -g @latest` 실행. **latest로 올리지 않으면 0.17 사용자에게 아무 일도 안 생긴다**
- **reap 리포에 v0.18 기획이 이미 있다**: ms-001(배포 형태를 plugin으로, main) · ms-002(지식 축 정리) + `vision/design/plugin-distribution.md`(실측 F1~F12, 결정 9). 이 기획은 reap 이전의 것 — ms-002의 목표(idea/·참조 체계·memory 재설계·interview)는 reap가 이미 실현했고, ms-001의 plugin 전환(gen-101)도 reap plugin/이 대체한다. **살아남는 것: 0.17.8 이행 다리 설계, F1~F12 실측, uninstall(gen-088)**
- **기능 대조의 기반**: reap spec `08-delivery.md`의 폐기 표가 대부분을 이미 결정 (lifecycle·cruise·evaluator·merge·opencode·migration layer 등). 새로 판단할 잔여: update/버전 안내, uninstall 상당물(spec은 "없음"으로 결정), config·status 명령, goal 개념, RELEASE notice·5로케일
- **migration 대상 데이터**: `.reap/`(config.yml·genome 3·environment·life/current.yml·backlog·lineage·vision/goals·design·milestones·memory 3단·sequence·hooks·migration-state) → `.reap/`(map·plan·genome 3·environment·vision/memory lessons·milestones·life 3종·archive·idea). 디렉토리가 달라 병행 존재 가능 — 마이그레이션이 원본을 파괴하지 않을 수 있다

## Dialogue

| 갈린 지점 | 선택지 | 사람의 답 | 추천 대비 |
|---|---|---|---|
| 자동 업데이트 차단 방식 | latest로 안 올림(추천) / floor 상향 / npm 중단 | **둘 다** — latest 회피 + floor 이중화 | 추천을 포함해 확장 채택 |
| reap 리포 구 v0.18 자산 | 추려서 승계(추천) / feat 브랜치 기반 / 전부 보류 | **추려서 승계** — 0.17.8 다리·F1~F12·uninstall 승계, gen-101·ms-002 닫기 | 추천 채택 |
| v0.18 브랜치 이식 방식 | 히스토리째 병합(추천) / 스냅샷 / 투 리포 | **스냅샷** — .reap 기록의 커밋 해시 참조 단절은 인지한 대가 | **추천 기각** |
| v0.18 이름 | reap 유지 / reap 개명 / reap+.reap 완전 통일 (추천 없음 — 사업 판단) | **reap·.reap/ 완전 통일.** migration skill이 기존 .reap/의 0.17 판정 → 디렉토리 리네임(충돌 대비) → 이주까지 전부 책임 | — |
| migration skill 세부 (되읽기 확인에 얹은 지시) | — | 리네임은 `.reap-v0_17/`(dot 회피). 진행 단계를 유저에게 표시하고 기록을 남긴다. 토큰 사용량이 클 수 있음을 고지한다. subagent 수행을 강제한다. 사용자 리포에 uncommitted change가 있으면 **block** | 사람 추가 지시 |
| 계획을 어디에 쓰나 | ps-4f2a91 확장(암묵) / 별도 문서 세트 | **별도 plan document set** — `docs/reap-plan/reap_v_0_18_migration/`을 새 plan source로 등록. ps-4f2a91은 소비 완료로 판정 | 사람이 선택지 밖 답 |
| 파생 backlog | — | "만료된 plan source를 확장할지, 만료 후 새 문서 세트로 갈지 유저에게 묻는 step"을 loop 절차에 추가 | 사람 추가 지시 |

## Open Questions

- 0.17.8 다리의 **코드 작성**이 이번 범위인가 (발행은 범위 밖 확정) — milestone 자를 때
- `.reap/` 세대·loop 기록을 v0.18 브랜치로 가져가는가, reap 리포에 남기는가 — 스냅샷 선택의 후속
- 이주 매핑 세부: goals.md·vision/design·lineage/sequence의 거취, 열린 generation이 있는 프로젝트 처리 — M3 자를 때
- 기능 잔여 판단 6건(03-compat.md의 미결 표) — M2에서
| 브랜치 첫 커밋 구조 | — | **apocalypse commit**(구 소스 전부 삭제) 후 **snapshot commit**(reap 적재) — 두 커밋으로 가른다 | 사람 추가 지시 |

## Outcome

- plan source **ps-4b485d** 신설 (`docs/reap-plan/reap_v_0_18_migration/` — README + 01~04)
- **ms-013** (v0.18 브랜치 신설과 귀환, focus) 잘림 — task 넷
- backlog **bk-bb11a1** (plan source 만료 분기 절차)
- M2(호환)·M3(migration skill)는 **아직 안 잘랐다** — M1 종료 후 이 loop를 이어 자른다. 그래서 loop는 열린 채다
| ms-013 fitness 중 방향 전환 | 개명 범위: 코드·플러그인만(기록·spec은 역사로 보존) vs 전면 | **전면** — 대소문자만 구분해 과감하게, 기록·히스토리도 싹다. v0.18 커밋 트리에 reap 문자열을 아예 남기지 않는다. 절차: reap 리포 안에서 replace를 먼저 완수 → v0.18을 apocalypse 시점으로 되돌려 재적재 | **사람이 agent의 보수적 범위를 기각** |

- **ms-013 닫힘 (2026-08-31)** — reap 리포 `v0.18` 브랜치: 1d1429b(apocalypse) · f164a05(snapshot, 출처 1a0b8fe) · 9993230(승계물). 트리·신규 커밋 메시지에 옛 이름 0건. main 55c020d(구 기획 정리), gen-101은 legacy/v017-plugin-distribution 보존. **다음: 이 loop를 이어 M2(호환)를 자른다**
| 기능 대조 6건 (ms-014 task 1) | 각각 만든다/안 만든다 | **전부 안 만든다/안 가져온다** — check-version(대상 없음)·uninstall(spec 유지, 구 자산은 M3)·config·status(YAGNI)·goal(plan source가 대체)·notice(배포 단계) | 위임 하 agent 판정 (gen-0066) |
- **ms-014 닫힘 (2026-08-31)** — v0.18: floor 0.18.0 + docs/release-policy.md(latest 금지·next 태그). 기능 6건 전부 안 만듦 확정. main 363e6e3(tests 4b29014): 0.17.8 다리 — upgrade-bridge 모듈(일일 캐시·next 안내)·installUpgradeAgent·agent stub(docs/upgrade-agent/). 전 스위트 통과(unit 829·e2e 391·scenario 62). **다음: M3(migration skill)를 자른다**
| 이주 매핑 미결 3건 (ms-015 task 1) | 각 2안 | 열린 generation은 **block**(동일 원칙) · design/은 **idea/files/**(승격은 안내만) · lineage/sequence는 **비승계**(원본 보존이 이력) | 위임 하 agent 판정 (gen-0070) |
- **ms-015 닫힘 (2026-08-31)** — migrate skill(판정·차단·고지·격리·subagent 이주·검증·기록·홈 정리 allowlist) + upgrade agent 본문(main) + **실물 검증**(reap main의 진짜 v0.17 데이터, doctor 0·원본 무손상·lessons 34→32 선별)
- **작전 완료.** 범위(브랜치 신설·호환·migration skill)가 전부 실현됐다. 범위 밖으로 남긴 것: 발행 전부(0.17.8 publish·next 태그·latest 승격·설치 스크립트), 홈 자산 정리의 실행, 미푸시 브랜치들의 push

## Dead Ends

- **ps-4f2a91 확장** — 계획을 기존 spec에 쓰려다 사람이 막음: 소비 완료된 소스였다. 새 문서 세트(ps-4b485d) 신설로 전환, 절차 공백은 bk-bb11a1로
- **보수적 개명 범위**(기록·spec을 역사로 보존) — fitness에서 기각됨. 전면 치환 + v0.18 재구축으로
- **히스토리 병합 이식**(추천안) — 사람이 스냅샷 선택. 기록 해시 단절은 인지된 대가

## Open Questions — 전부 답함

0.17.8 다리 범위(→M2 포함, gen-0068) · 기록 이식(→gen-0061) · 매핑 세부(→gen-0070) · 기능 6건(→gen-0066)
