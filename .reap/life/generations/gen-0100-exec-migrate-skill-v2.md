---
id: gen-0100-exec
slug: migrate-skill-v2
type: exec
milestone: ms-024
title: migration-map·SKILL 개정 — 작업 상태 복원 매핑과 검증 스크립트
startedAt: 2026-09-04T15:59:41Z
startCommit: 07ad883
status: closed
closedAt: 2026-09-04T16:12:38Z
endCommit: bd79356
---
## Intent

ms-024 task 1 — tasks/1-skill-revision.md 전부: migration-map 매핑 #1·#2·#5·#6 재정의, #11·#12 신설, `scripts/verify-migration.sh`, SKILL 7/8·8/8 갱신, bk-d0eef8(하위 디렉토리·링크·분량 세기·backlog 재발급 방지)도 함께 소비. 끝은 skill 문서가 selfview 실물을 기준으로 실행 가능한 지시가 되는 것 — 검증은 task 2의 재이주.

## Delegation

brief로 subagent에게 — 주 트리. `make`·`mark` 금지(backlog 소비 표시는 주 세션이).

## Outcome

**A. `references/migration-map.md`** — 매핑 12개 전부 표에 있다. #1(genome 어휘 치환표 — embryo/normal·adapt/reflect phase·completion artifact·genome-change backlog·environment refresh·autoSubagent/cruise/evaluator·lineage), #2(shortterm 다음 후보·midterm 살아있는 트랙은 lessons 아니라 #11 전용 재료로 명시), #3(lineage 05-completion과 코드 대조 후 해소된 것 재발급 금지, 근거 `## Not moved`에), #5(goals.md → `docs/plan/goals.md` 이동+`make plan-source`로 즉시 등록+규약 파일, 사람 판단 미루지 않음), #6(참조 판정 기준=live goals/살아있는 midterm·shortterm에 경로가 나오는가; 참조되면 디렉토리째 `docs/plan/<track>/`로, 안 되면 문서 단위 idea — bk-d0eef8의 하위 디렉토리·상호링크는 "문서 단위 유지 + `원본 묶음:` 머리글 + 파일명→새 idea 매핑표로 링크 기계적 치환" 방식으로 확정), #11 신설(마지막 lineage completion의 Next Generation Hints + shortterm 다음 후보 + midterm 트랙 → 최우선 트랙 하나만 focus milestone, 나머지 트랙·트랙 내 deferred 항목은 backlog, 미정 질문은 idea/research), #12 신설(CLAUDE.md `## REAP` 절 교체 — v0.18 본문을 지시문에 직접 실음, 절 없으면 생성 안 함). #1·#6·#11·#12는 표 안에 다 못 넣어 표 아래 `## Detail — mapping #N` 절로 뺐다(표 셀 안 중첩 표/코드블록은 렌더링이 불안정해서).

**B. `scripts/verify-migration.sh`** — tasks/1의 검사 여섯을 그대로 스크립트화(`REAP_BIN` 환경변수, 인자 `<project-root>`, 각 줄 `ok:`/`FAIL:`, 하나라도 FAIL이면 exit 1). selfview 1차 결과(`/Users/hichoi/cdws/selfview`, dist/reap 빌드로 실행)에 돌린 실측:

```
FAIL: 진행 중 트랙 → focus milestone — 원본 shortterm/goals에 다음 트랙이 있었지만 새 .reap에 focus milestone이 없다
FAIL: genome에 v0.17 어휘 없음 — 7건
FAIL: CLAUDE.md가 v0.18 어휘 — reap-guide/reap-evolve/@.reap import 잔존 2건
FAIL: goals → plan source 등록 — reap plan sources: 등록된 plan source가 없습니다
FAIL: ctx 상태 줄에 milestone — reap ctx 출력에 '현재 milestone:'/'Milestone:' 줄이 없다
ok: doctor 결함 0
exit=1
```
지시문대로 FAIL이 정상 — 1차 이주가 구조만 옮기고 작업 상태를 안 옮겼다는 milestone Background의 진단과 정확히 일치한다.

**C. `SKILL.md`** — 1/8 표의 `unknown` 행 문구를 detect-version.sh의 evidence 줄과 같게 맞췄다. 3/8에 design 문서 수(`find vision/design -type f`, 디렉토리 아님)·마지막 lineage id·CLAUDE.md `## REAP` 절 유무 측정을 추가했다. 6/8에 "매핑 열둘"로 갱신. 7/8에 `verify-migration.sh` 실행과 "모든 줄이 `ok:`" 통과 조건을 추가(doctor 뒤, 8/8 진입 전 게이트). 8/8에 `## 다음 세션이 볼 것`(reap ctx 상태 줄 전문) 절 신설을 지시. 기록 파일 템플릿(`references/migration-map.md`의 `## Record file`)도 `## 검증`에 verify 출력 추가·`## 다음 세션이 볼 것` 항목을 함께 갱신해 SKILL과 어긋나지 않게 했다.

**bk-d0eef8 소비** — #6 detail 절에서 확정(문서 단위 + 원본 묶음 머리글 + 링크 기계적 치환, doctor로 검증). 소비 표시(`mark backlog --consumed`)는 지시대로 안 함 — 주 세션 몫.

## Dead Ends

- **D(테스트)는 커밋하지 못했다.** brief는 `tests/migrate-scripts.test.sh` 작성과 `ci.yml`·`release.yml`의 "hook.test.sh 줄 옆에 한 줄 추가"를 함께 요청했지만, (1) brief 자신의 "작업 트리·규율" 절이 `tests/` submodule을 명시적으로 불가침이라 했고 실제로 이 세션에 `tests-submodule`이라는 별도 agent가 떠 있다 — 그 agent와 충돌할 수 있어 커밋하지 않았다. (2) `ci.yml`·`release.yml`을 읽어보니 애초에 `hook.test.sh`를 직접 부르는 줄이 없다 — 둘 다 `bun test`/`hook.test.sh`를 이 리포에서 안 돌리고 push 시 private `reap-test` 리포로 dispatch만 한다(`environment/summary.md`에도 적혀 있음). "옆에 한 줄"이라고 붙일 기존 줄 자체가 없어 워크플로 파일은 손대지 않았다.
- 대신 `tests/migrate-scripts.test.sh`는 **작업 트리에 파일로만 남겨뒀다**(커밋 안 함) — `detect-version.sh` 6케이스(none·v017-lineage·v017-hook·v018·mixed·unknown-shared-names) + `verify-migration.sh` pass/fail 케이스(mock `reap` 바이너리), `bash tests/migrate-scripts.test.sh` 로컬 실행하면 10개 다 PASS. `tests-submodule` agent나 주 세션이 이 파일을 submodule 쪽에서 커밋할지 판단해야 한다.
