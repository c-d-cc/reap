# Learning

## Project Overview

REAP v0.17.2 (미릴리즈), embryo generation 75. 유저 지시로 본 세대까지 0.17.2 에 포함한 뒤 함께 릴리즈한다. 3건 orchestrate 의 마지막 정리 작업.

## Source Backlog

`genome-line-threshold100-가-배포-템플릿evolutionmd-175줄보다-작아-신규-init-이-즉시-warning.md` (consumed by gen-075-c791fb)

gen-072 에서 memory 크기 warning e2e 의 **대조군 테스트**(정상 프로젝트는 조용해야 함)를 작성하다 발견.

## Key Findings

### 1. 실측 — `reap init` 직후 evolution.md 만 초과한다

임시 프로젝트에 `reap init` 실행 후 측정:

| 파일 | init 직후 | 본 repo | threshold(현재) | 판정 |
|---|---|---|---|---|
| `application.md` | 16 | 205 | 100 | init OK / 본 repo 초과 |
| `evolution.md` | **193** | 270 | 100 | **init 즉시 초과** |
| `invariants.md` | 7 | 7 | 100 | OK |

`application.md` 는 init 시 16줄짜리 뼈대만 생성되고 `genome-suggest` 가 프로젝트를 스캔해 채운다. 따라서 **신규 사용자가 첫 `fix --check` 에서 보는 warning 은 `evolution.md` 1건**이다.

배포 템플릿(`src/templates/evolution.md`) 자체가 193줄이므로, threshold 100 은 **REAP 이 스스로 만족할 수 없는 기준**이다. gen-072 이전(146줄)에도 이미 초과였다.

### 2. threshold 100 은 근거가 어디에도 없다

```
grep -n "100 line\|line guideline" src/templates/reap-guide.md → 매치 없음
```

`GENOME_LINE_WARNING_THRESHOLD = 100` (`integrity.ts:21`) 은 코드에만 존재하고 주석도 문서도 없다. 왜 100인지, 무엇을 막으려는 수치인지 알 수 없다.

대조: gen-072 가 추가한 `MEMORY_LINE_WARNING_THRESHOLDS` 는 `reap-guide.md` § Memory 에 문서화된 범위("30~50", "50~70")의 상한을 채택하고 그 근거를 주석에 적었다. **같은 파일 안에서 한쪽은 근거가 있고 한쪽은 없다.**

### 3. 부수 발견 — docs 와 코드가 environment summary 기준에서 불일치

`docs/src/i18n/translations/en.ts`:
```
L712  ├── summary.md      # Always loaded (~100 lines) — tech stack, ...
L720  ["summary.md", "Always loaded at session start", ..., "~100 lines"]
```

gen-072 는 `ENV_SUMMARY_LINE_WARNING_THRESHOLD = 250` 으로 설정했다. **문서는 ~100, 코드는 250** 이며 본 repo 의 실제 `summary.md` 는 212줄이다.

사용자가 문서를 믿고 100줄로 유지하려 하면 실제로는 불필요한 압축이고, 코드를 믿으면 문서가 틀린 것이다. 크기 기준을 다루는 본 세대와 **같은 축의 문제**이므로 함께 처리한다 (genome § "인과로 묶인 fix", small scope).

### 4. 방향 검토 — backlog 의 A/B/C/D

| 안 | 내용 | 평가 |
|---|---|---|
| A. threshold 상향 | 단일 상수를 배포 템플릿보다 크게 | 단순하나 "그럼 100은 뭐였나"가 남고, 세 파일의 성격 차이를 무시 |
| B. 템플릿 축소 | evolution.md 를 줄임 | **불가.** gen-072/073 이 추가한 pruning 정책·carrier 규칙은 필수 내용이며, 줄이면 issue #21 이 되돌아온다 |
| C. 기준선 대비 측정 | 배포 템플릿 크기를 런타임에 읽어 "사용자 추가분"만 측정 | 의미론적으로 가장 정확하나, integrity check 에 파일 읽기 실패 경로가 생긴다. 진단 도구는 단순해야 한다 |
| D. 파일별 개별 threshold | application / evolution / invariants 각각 | **채택.** 세 파일은 성격이 다르다 — invariants 는 짧아야 맞고(배포 7줄), evolution 은 규칙 집합이라 길어지는 것이 자연스럽다. gen-072 의 `MEMORY_LINE_WARNING_THRESHOLDS` 패턴과도 일관 |

### 5. 수치 결정에 필요한 것 — 근거

gen-072 교훈("임계값에는 근거가 함께 있어야 한다")을 지켜야 한다. 자의적 상수를 넣으면 이번 문제를 반복하는 것이다.

근거의 축: **"배포 시점 크기 + 사용자가 자기 프로젝트 내용을 더할 여지"**. 각 파일이 무엇을 담는지에서 도출한다.
- `invariants.md` — 인간만 수정하는 절대 제약. 길어지면 그 자체가 문제 신호
- `evolution.md` — AI 행동 규칙. 프로젝트가 성숙하며 규칙이 쌓이는 것이 정상
- `application.md` — 프로젝트 정체성·아키텍처. 프로젝트 규모에 비례

## Previous Generation Reference

gen-072 가 이 문제를 발견하고 backlog 등록. 당시 e2e 의 "stays quiet" 대조군 테스트 필터를 gen-072 대상(`vision/memory/`, `environment/summary.md`)으로 좁히고 **"해결 시 이 예외를 제거할 것"** 을 주석에 남겼다. 본 세대가 그 예외를 제거할 수 있으면 해결 확인 지표가 된다.

## Backlog Review

pending 3건. 본 세대 후: interview(0.18.0) / daemon 2건(유저 보류). 본 세대가 0.17.2 의 마지막 작업이다.

## Context for This Generation

### Clarity Level: **High**

원인이 실측으로 확정됐고 방향 4안이 backlog 에 제시돼 있다. 다만 **수치 결정은 판단이 필요**하며, 근거 없이 정하면 이번 문제를 반복한다.

### 특수 제약

- **"경고를 없애려고 임계를 올린다"는 인상을 피해야 한다.** threshold 100 이 근거 없이 배포 템플릿보다 작았다는 사실이 재설정의 정당성이며, 새 수치에는 반드시 근거를 붙인다
- **0.17.2 마지막 세대** — completion 에서 릴리즈 노트에 gen-073/074/075 내용을 보강해야 한다 (shortterm 기록 참조)
