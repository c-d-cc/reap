---
name: migrate
description: Use when a project carries v0.17-era REAP data - a .reap/ with the old 5-stage pipeline layout (memory tiers, lineage/, current.yml) - and it must move to the v0.18 layout. Detects the old structure, blocks on uncommitted changes or an open generation, isolates the original as .reap-v0_17/, migrates data via a subagent, verifies with doctor, and leaves a written record. Trigger on "migration", "v0.17에서 왔다", "구 reap 프로젝트", "이주", or when the reap-upgrade agent hands over after installing v0.18, in a repo whose .reap/ shows the old structure.
---

# migrate — v0.17을 v0.18로 옮긴다

**원본 비파괴가 불변식이다.** 이 skill의 어느 단계도 구 데이터를 수정하지 않는다 — 구 데이터는 `.reap-v0_17/`로 자리만 옮겨 통째로 남고, 그 디렉토리가 있는 한 언제든 되돌릴 수 있다.

## 절차는 여덟 단계다 — 각 단계를 시작할 때 "단계 N/8: <이름>"을 사용자에게 보여준다

1. 판정 · 2. 사전 차단 · 3. 고지와 동의 · 4. 격리 · 5. 새 구조 · 6. 이주(subagent) · 7. 검증 · 8. 기록과 홈 정리 안내

## 1/8 — 판정: 무엇이 있는지부터. 어떤 파일도 옮기기 전에

`.reap/`을 열어 **구조 지문**을 본다.

| 지문 | v0.17이다 |
|---|---|
| `config.yml`에 `autoSubagent` · `autoUpdate` · `lastMigratedVersion` · `strictEdit` 중 하나라도 | ✓ |
| `vision/memory/shortterm.md`(3단 memory) 또는 `lineage/` 또는 `life/current.yml` | ✓ |

| 지문 | v0.18이다 — **이주할 것 없음**으로 종료 |
|---|---|
| `map.md` + `vision/`·`life/`·`archive/` 3단 + `sequence/generation.md` | ✓ |

**`agentClient`·`language`는 지문이 아니다** — 양쪽 config에 다 있다. **둘 다 아니면 멈추고 사람에게 보인다** — v0.15·v0.16은 구 reap의 `reap migrate`가 담당하던 영역이라 이 skill이 아는 척하면 안 된다. `.reap/`이 아예 없으면 이 skill의 일이 아니다(`init`이다).

## 2/8 — 사전 차단: 둘 중 하나라도 걸리면 진행하지 않는다

- **uncommitted change가 있으면 block한다.** `git status --porcelain`이 비어야 한다. 되돌릴 수 없는 이동을 더러운 트리 위에서 하지 않는다 — 커밋하거나 stash한 뒤 다시 부르라고 안내하고 끝낸다. git 리포가 아니면 그 사실을 알리고 **사람이 명시적으로 승인할 때만** 진행한다(격리 되돌리기 외의 안전망이 없다)
- **열린 generation이 있으면 block한다.** `life/current.yml`이 있고 그 안의 stage가 진행 중이면, 구 reap로 닫거나(`reap run abort` 또는 완료) 그럴 수 없으면 그 사실을 인지했다는 사람의 확인을 받은 뒤에만 진행한다. 반쯤 도는 세대 위에서 저장소를 갈아끼우지 않는다 — uncommitted와 같은 원칙이다

## 3/8 — 고지와 동의: 시작 전에 전부 말한다

동의를 받기 전에 보여줄 것 셋:

- **단계 목록**(위의 여덟)과 지금 프로젝트에서 각 단계가 다룰 분량(memory 파일 크기, lineage 개수, backlog 개수 — `ls | wc -l` 수준의 실측)
- **토큰 고지**: 이주는 memory·기록 전체를 읽고 선별하는 작업이라 **토큰 사용량이 매우 클 수 있다**
- **비파괴 약속**: 원본은 `.reap-v0_17/`로 이름만 바뀌어 전부 남고, 되돌리기는 mv 한 번이다

명시적 동의 없이 4단계로 넘어가지 않는다.

## 4/8 — 격리: 이름을 바꿔 충돌을 원천 차단한다

```bash
git mv .reap .reap-v0_17    # git 추적 중일 때. 아니면: mv .reap .reap-v0_17
```

- 이름에 **dot을 넣지 않는다** (`.reap-v0.17` 금지) — 도구·글롭이 확장자로 오독한다
- `.reap/.index/`·`.session-state.md` 같은 gitignore 산출물도 디렉토리를 따라간다 — 지문·이주 어느 쪽에도 쓰지 않고 그대로 둔다
- **되돌리기**: 새 `.reap/`을 지우고 `mv .reap-v0_17 .reap`. 이 한 줄이 서는 한 실패해도 원상이다 — 사용자에게도 이 문장을 보여준다

## 5/8 — 새 구조

`reap init`으로 새 `.reap/`을 세운다. `config.yml`의 `language`·`agentClient`는 구 config 값을 이어받아 적는다 — 그 둘만이 양쪽에 다 있는 사용자 설정이다.

## 6/8 — 이주는 subagent가 한다

주 세션의 컨텍스트를 구 데이터로 채우지 않는다 — **매핑 표와 지시문은 [migration-map.md](references/migration-map.md)에 있고, 그 문서를 subagent에게 주어 수행시킨다.** 이 문서는 task 2가 채운다.

## 7/8 — 검증

`reap doctor`가 **결함 0**이어야 한다. 결함이 나오면 고치고 다시 — 통과 전에는 8단계로 가지 않는다. `.reap-v0_17/`이 무손상인지도 본다(`git status`에 그 안의 변경이 없어야 한다).

## 8/8 — 기록과 홈 정리 안내

기록 파일(`archive/migration-v0_17.md`)의 형식과 홈 자산 정리 절차는 [migration-map.md](references/migration-map.md)의 뒷부분이 담는다.
