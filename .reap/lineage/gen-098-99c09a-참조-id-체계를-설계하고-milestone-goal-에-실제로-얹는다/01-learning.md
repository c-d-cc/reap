# Learning

## Project Overview

gen-097 이 milestone 을 도입했고, **첫 사용에서 세 번 걸렸다.** 셋 다 같은 뿌리다 —
한 자리가 다른 자리를 **제목·형식으로** 가리키고 있다.

이 generation 은 `v018-지식-축-정리` milestone 의 **첫 항목**이며, main(`v018-배포-형태를-plugin-으로`)
이 아닌 milestone 에서 앞당겨 시작한 것이 아니라 **병렬 트랙**이다. 두 milestone 은 브랜치가 다르고
goal 이 다르다.

## Source Backlog

`참조-id-체계-한-자리가-다른-자리를-어떻게-가리키는가.md` (consumed by gen-098-99c09a)

### 증상 셋 — 전부 gen-097 의 첫 사용에서 나왔다

| # | 무엇 | 어디서 |
|---|---|---|
| 1 | `goal:` 이 `goals.md` 제목과 **정확 일치**해야 한다. `**` 강조와 대시 뒤 설명이 제목의 일부라 거부됐다 | `validateForMain` |
| 2 | `## Generations` 항목을 두 줄로 쓰면 **둘째 줄이 조용히 버려진다** | `readGenerations` |
| 3 | `## Exit Criteria` · `## Out of Scope` 도 같다 — **완료 판정 기준이 잘린다** | `readBullets` |

증상 3 은 이 세대 착수 직후 `.reap/.session-state.md` 에서 발견했다. **하필 잘린 것이 이 세대가
"됐다"를 판정할 기준이었다.** 임시로 milestone 파일의 bullet 을 한 줄로 폈다(vision 파일이므로
자유 편집). 파서 수정은 이 세대의 일이다.

### 사용자 결정 (2026-08-21)

**ID 체계로 간다. 그리고 나머지 작업보다 먼저 한다.**

검토했던 대안 둘은 기각:
- **매칭 넓히기** — 임시 처방. 뒤에 ID 로 바꾸면 같은 코드를 두 번 만진다
- **표기 규약** — 사람이 매번 기억해야 한다. genome 은 "반복 누락은 지시가 아니라 검사로 막는다"

**먼저 하는 이유**: 참조 소비자가 곧 셋이 된다. 나중에 정하면 셋이 각자 방식을 발명하고,
통일하려면 셋을 동시에 고쳐야 한다.

## Key Findings

### 1. REAP 은 이미 참조 체계를 갖고 있다 — 다섯 개, 서로 다른 모양으로

| 참조 | 무엇으로 가리키나 | 안정적인가 |
|---|---|---|
| `current.yml.milestoneId` → milestone | **파일 slug** | **예** — 파일명은 제목을 바꿔도 안 변한다 |
| `current.yml.sourceBacklog` → backlog | **파일명** | **예** |
| `lineage/*/meta.yml.parents` → generation | **`gen-NNN-hash`** | **예** — 생성 시 확정 |
| `reap:carrier(<id>)` → 사실 | **손으로 정한 문자열** | 예 (단 고유성·고아는 `list-carriers.sh` 가 본다) |
| milestone `goal:` → goals.md 항목 | **제목 문자열** | **아니오** ← 유일한 예외 |

**이것이 이 세대의 핵심 발견이다.** "ID 체계를 발명한다"가 아니라 **이미 넷이 안정적이고 하나만
그렇지 않다.**

### 2. 왜 goal 만 예외인가 — 파일이 아니라 줄이기 때문

`parseGoals` (`src/core/vision.ts`) 는 `goals.md` 를 줄 단위로 훑는다:

```
### <섹션>
- [ ] <제목>      →  VisionGoal { title, checked, section, raw }
```

**항목이 파일이 아니므로 파일명이 없고, 따라서 제목 말고 가리킬 것이 없다.**
나머지 축은 전부 파일당 하나다:

| 축 | 단위 | 주소 |
|---|---|---|
| `vision/milestones/` | 파일 | slug ✅ |
| `vision/design/` | 파일 | slug ✅ |
| `life/backlog/` | 파일 | 파일명 ✅ |
| `lineage/` | 디렉토리 | gen id ✅ |
| `environment/{domain,resources,docs}/` | 파일 | 경로 ✅ |
| **`vision/goals.md`** | **줄** | **없음** ❌ |
| `vision/memory/` | **지금은 섹션** | 없음 ❌ → v0.18 재설계 후 파일 |
| `.reap/idea/` | 파일 (예정) | slug ✅ |

**memory 는 v0.18 재설계가 파일 단위로 바꾸므로 자연히 해결된다.** 그러면 남는 것은 goals.md 뿐이다.

### 3. 그러므로 설계 질문이 좁아진다

"모든 축에 ID 를 부여할까"가 아니라:

**(a) 줄 단위 항목(goals.md)에 어떻게 안정된 주소를 주는가**
**(b) 다섯 가지 서로 다른 참조 표기를 하나로 볼 것인가**

(b)가 실질이다. 지금 `milestoneId` 는 slug 문자열, `parents` 는 gen id 문자열, `sourceBacklog` 는
파일명 문자열 — **필드 이름이 타입을 대신하고 있다.** memory 의 `from`/`to` 는 **여러 종류를 한
필드에** 담아야 하므로 그 방식을 쓸 수 없다. 여기서 표기가 필요해진다 (`goal:xxx` / `gen:xxx` 류).

### 4. 소비자 셋의 요구가 서로 다르다

| 소비자 | 무엇을 가리키나 | 요구 |
|---|---|---|
| milestone → goal | goals.md 항목 **한 종류** | 존재 검증 + 거부 |
| memory `from`/`to` | **여러 종류 혼재** (generation·문서·backlog·개념) | 종류를 구분할 표기 · 느슨한 검증 |
| idea 졸업 | `research/` → `design/` 또는 backlog | **이동**의 기록. 대상이 나중에 생긴다 |

세 번째가 까다롭다 — **아직 존재하지 않는 것을 가리켜야 한다.** milestone→goal 처럼 거부하면
idea 는 졸업 경로를 적을 수 없다.

### 5. ID 는 검사를 없애주지 않는다 — 오히려 늘린다

backlog 가 이미 적어둔 것이고, 코드가 그것을 뒷받침한다:

- **고유성** — `list-carriers.sh --orphans` 가 carrier 에 대해 하는 일이 필요해진다
- **끊어진 참조** — 대상이 삭제되면 조용히 허공을 가리킨다. 이것도 carrier 와 같은 문제
- 즉 **기각한 "표기 규약 + 검사" 의 검사 부분이 ID 안에 그대로 들어 있다**

## Previous Generation Reference

gen-097 (milestone 도입). fitness: `ok`.

이월되는 것 셋:

- **소비자 없는 체계는 검증되지 않는다.** gen-097 이 문 3 의 판정 기준을 "후보가 나온다"가 아니라
  "휴리스틱 블록이 사라졌는가"로 잡은 이유다. 이 세대도 **설계만 하고 끝내면 안 된다** — 첫 소비자
  (milestone→goal)에 실제로 얹어야 한다
- **명령을 돌리고 다른 질문의 답을 읽지 마라.** gen-097 이 `grep -rln "goal"` 결과 14를
  "buildBasePrompt 호출자 14"로 읽었고 실제로는 1이었다
- **새 기능의 테스트는 새 기능만 본다.** gen-097 이 `cruise` 를 부숴뜨렸고 잡은 것은 기존 테스트였다

## Backlog Review

`life/backlog/` 는 source backlog 하나뿐이었고 소비했다. 지금 비어 있다.

`vision/design/backlogs_v0.18/` 4건 중 **`memory-…재설계`** 가 이 세대의 결과에 직접 의존한다
(그 backlog 의 `from`/`to` 가 이 세대가 정하는 표기를 쓴다). **`idea-…`** 도 졸업 경로에서 같다.

## Context for This Generation

**Clarity: high.**

근거: (a) 증상 셋이 전부 재현 가능하고 실제로 관측됐다 (b) 사용자가 방향(ID)과 순서(먼저)를
명시했다 (c) 기존 참조 다섯을 전수 확인해 **문제가 goals.md 한 곳으로 좁혀졌다**.

**가정**:
- 이 세대는 **첫 소비자(milestone→goal)까지만** 적용한다. memory 와 idea 는 각자의 세대가 쓴다 —
  다만 **그들이 쓸 수 있는 표기인지**는 여기서 검증해야 한다
- 증상 2·3(파서의 이어진 줄)도 이 세대에서 처리한다. 같은 뿌리이고, 증상 3 은 완료 판정 기준을
  잘라먹는다
- `goals.md` 는 **사용자 소유 파일**이다. REAP 이 자동으로 고쳐 쓰지 않는다는 기존 경계를 넘을지가
  planning 의 결정 사항이다
- 버전 bump 없음. migration note 는 v0.18 릴리즈 세대가 묶어서 쓴다 (gen-097 과 동일)
