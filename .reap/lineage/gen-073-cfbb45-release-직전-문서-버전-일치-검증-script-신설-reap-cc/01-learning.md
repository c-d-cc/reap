# Learning

## Project Overview

REAP v0.17.2 (gen-072 에서 bump, 아직 태그 미생성 = 미릴리즈). embryo generation 73.

본 세대의 목적은 **0.17.2 를 깨끗이 릴리즈 가능한 상태로 만드는 것** + **문서 누락이 재발하지 않도록 검증 장치를 심는 것**이다. 3건 orchestrate 중 두 번째.

## Source Backlog

`release-직전-문서-버전-일치-검증-reapcc-문서-갱신.md` (consumed by gen-073-cfbb45)

## Key Findings

### ⚠️ backlog 의 사실 오류 정정 — `RELEASE_NOTES.md` 는 누락 상태가 **아니다**

backlog Problem §1 은 "RELEASE_NOTES.md 최신 = 0.17.0 ❌" 로 적었으나 **틀렸다.** `grep -n "^## "` 로 헤더만 보고 `## What's New` 의 의미를 놓친 결과다.

실제 구조 (`.github/workflows/release.yml:39` — `body_path: RELEASE_NOTES.md`):

```
## What's New          ← 현재 릴리즈 내용. GitHub release body 로 그대로 발행됨
  (v0.17.1 내용이 여기 있음 — 정상)
---
## v0.17.0             ← 이전 버전 아카이브
## v0.16.6
...
```

즉 릴리즈 시 `What's New` 를 새 내용으로 갈고, 직전 내용을 `## vX.Y.Z` 로 승격하는 구조다. `git show 329fb68:RELEASE_NOTES.md` 로 v0.17.1 커밋 시점에도 같은 패턴이었음을 확인했다.

**따라서 실제 할 일은 "0.17.1 추가"가 아니라 "What's New 를 0.17.2 로 교체 + 0.17.1 을 아카이브로 승격"이다.**

부수 시사점: `What's New` 에는 **버전 번호가 없다.** 파일만 봐서는 어느 버전인지 알 수 없으므로, 검증 스크립트가 이 파일에서 버전을 파싱하는 것은 불가능하다. 검사 항목 재설계 필요 (아래 §4).

### 1. docs/ 의 changelog 누락은 사실 (확인됨)

| 소스 | 최신 | 상태 |
|---|---|---|
| `package.json` | 0.17.2 | — |
| `RELEASE_NOTICE.md` | v0.17.2 | ✅ (gen-072 에서 추가) |
| `RELEASE_NOTES.md` | What's New = v0.17.1 | ⚠️ 0.17.2 로 교체 필요 |
| `docs/src/i18n/translations/*.ts` | **0.17.0** (5개 전부) | ❌ 0.17.1 + 0.17.2 누락 |

changelog 는 `releaseNotes.versions[]` 배열 (en 기준 L1046~). 최신이 배열 첫 원소.

### 2. 로케일 drift 확인 (backlog 내용 사실)

| 로케일 | 항목 수 | 비고 |
|---|---|---|
| en | 18 | 기준 |
| ko | 18 | 동일 |
| ja | 17 | **0.16.5 누락** |
| de | 17 | **0.16.5 누락** |
| zh-CN | 17 | **0.16.5 누락** |

en/ko 만 갱신하고 나머지를 빠뜨린 전례. **버전 일치만 검사하면 이 유형을 못 잡으므로 집합 동일성 검사가 필요**하다는 backlog 판단이 옳다.

### 3. reap.cc 가 폐기된 memory 규칙을 가르치고 있다 (중대 — issue #21 의 문서판 재현)

`docs/src/i18n/translations/en.ts` 두 곳에서 **lifespan 기준 분류**를 표로 제시한다:

```
L919  memoryHeaders: ["Tier", "Lifespan", "Content", "Update Trigger"]
L921  ["longterm",  "Project lifetime", ..., "When lessons emerge"]
L922  ["midterm",   "Multiple generations", ..., "When context changes"]
L923  ["shortterm", "1-2 sessions", ..., "Every generation (mandatory)"]

L954  memoryHeaders: ["Tier", "Lifespan", "Purpose"]
L955-957  동일한 lifespan 표 (Vision 페이지)

L929  memoryRules: "Place content in the tier matching its expected lifespan."
```

v0.17.1/0.17.2 가 **정확히 이 휴리스틱을 root cause 로 지목하고 폐기**했는데, 공식 문서 사이트는 여전히 이것을 가르친다. 신규 사용자는 reap.cc 를 보고 배우므로 **문서가 구버전 규칙의 새로운 carrier 가 된 상태**다.

gen-072 가 genome 에 새로 넣은 "규칙 변경 시 carrier 3중 확인" 이 정확히 이 케이스를 예고한다 — 다만 그때는 carrier 를 guide/genome/prompt 3곳으로 봤고, **docs 사이트라는 4번째 carrier 는 목록에 없었다.**

`pruning` 관련 서술도 문서에 전무하다 (`whenToUpdateItems` 는 "언제 쓰는가"만 있고 "무엇을 지우는가"가 없음).

### 4. 검증 장치 부재 (backlog 내용 사실) + 설계 제약 발견

`.github/workflows/release.yml` 은 tag push → `npm ci` → `npm run build` → `npm publish` 로 직행. 검증 단계 없음.
`.github/workflows/docs.yml` 은 `docs/**`, `media/**`, `README*.md` 변경 시 main push 에서 빌드/배포. 내용 검증 없음.

**설계 제약 (§ 정정에서 도출)**: `RELEASE_NOTES.md` 의 `What's New` 에는 버전 번호가 없으므로 "package.json 과 RELEASE_NOTES 버전 일치" 검사는 **불가능**하다. 대안:
- (a) `What's New` 섹션이 직전 릴리즈 이후 수정됐는지 git 으로 확인
- (b) 최상단 아카이브 헤더(`## vX.Y.Z`)가 **직전** 버전인지 확인 — 승격이 이뤄졌는지 간접 검증
- (c) 이 파일은 검사 대상에서 제외하고 `RELEASE_NOTICE.md` + docs 만 검사

(b)가 가장 실질적이다 — 승격을 잊으면 GitHub release body 가 직전 버전 내용으로 나가는 실질적 사고를 잡는다.

### 5. `RELEASE_NOTICE.md` 와 `RELEASE_NOTES.md` 는 별개다 (혼동 주의)

| 파일 | 용도 | 소비자 |
|---|---|---|
| `RELEASE_NOTICE.md` | 버전+언어별 짧은 노트 | `src/core/notice.ts` → CLI 업그레이드 시 터미널 표시 |
| `RELEASE_NOTES.md` | 릴리즈 전문 | `release.yml` → GitHub release body |

이름이 비슷해 혼동하기 쉽다. 검증 스크립트와 문서에서 명확히 구분할 것.

## Previous Generation Reference

gen-072 가 0.17.2 로 bump 하고 `RELEASE_NOTICE.md` v0.17.2 를 추가했으나 `RELEASE_NOTES.md` / `docs/` 는 **의도적으로 유보**했다 (본 backlog 담당이라 충돌 방지). 그 몫이 본 세대에 있다.

gen-072 의 genome 추가분 "규칙 변경 시 carrier 3중 확인" 이 본 세대와 직결된다 — §3 이 그 목록에서 빠진 4번째 carrier(docs 사이트)를 드러냈다.

## Backlog Review

**Source**: 위 항목 (consumed)

pending 5건 중 본 세대 관련:
- `genome-line-threshold100-...` / `scenario-multi-generation-...` — gen-072 에서 발견, 무관
- `interview 기능` — 다음 세대 (0.18.0)
- daemon 2건 — 유저 판단으로 보류

## Context for This Generation

### Clarity Level: **High**

backlog 가 파일·라인 단위로 특정돼 있고 조사로 사실 확인이 끝났다. 다만 backlog 에 사실 오류 1건(§ 정정)이 있었으므로, **backlog 를 그대로 신뢰하지 말고 검증하며 진행**한다.

### Open Decisions 처리 방침

backlog 의 미결 3건에 대한 본 세대 판단:

1. **ja/de/zh-CN 번역** → 직접 작성한다. 기존 17개 항목이 모두 번역돼 있어 en 혼입은 일관성을 깬다
2. **ci.yml 검증 추가** → 하지 않는다. 개발 중 `package.json` 이 문서보다 앞서는 것은 정상 상태인데 이를 fail 로 처리하면 상시 red 가 되어 신호 가치를 잃는다. release 게이트로 충분
3. **문서 본문 갱신 범위** → **이번에 한다.** §3 은 changelog 누락보다 심각하다 — 공식 문서가 폐기된 규칙을 가르치는 것은 사용자를 잘못 학습시킨다. 5개 로케일 × 2개 위치로 작업량은 크지만 미루면 그동안 계속 오도한다

### 특수 제약

- **docs 빌드 검증 필수**: changelog 가 TS 객체 배열이므로 구문 오류 시 `vite build` 가 깨진다. 5개 파일 수정 후 반드시 빌드
- **`.github/workflows/docs.yml` 은 `docs/**` 변경 시 자동 배포** — main push 시점에 reap.cc 가 갱신된다. 잘못된 내용을 푸시하면 즉시 공개되므로 빌드 확인 후 커밋
