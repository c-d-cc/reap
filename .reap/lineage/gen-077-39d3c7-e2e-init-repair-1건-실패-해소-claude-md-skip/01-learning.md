# Learning

## Project Overview

REAP v0.17.3 (미릴리즈), embryo generation 77. 유저 지시로 **이번 이슈 계열 backlog 3건을 0.17.3 에 묶어** 릴리즈한다. 본 세대가 그 첫 번째다.

## Source Backlog

`e2e-init-repair-1건-실패-6세대째-pre-existing-claudemd-skip-판정-불일치.md` (consumed by gen-077-39d3c7)

gen-072~076 에서 6번 관찰되고 6번 다 "다음 세대 hints" 로 넘어간 뒤, gen-076 에서 backlog 화됐다.

## Key Findings

### 1. 원인 확정 — 판정 기준이 두 곳에서 다르다

실측:

```
fixture:  "# My Project\n\nSome content with .reap/genome/ reference.\n"
결과:     repaired: ['CLAUDE.md (appended)']   skipped: []
```

`ensureClaudeMd` 가 `"appended"` 를 반환한다. 즉 이 CLAUDE.md 를 **"REAP 섹션 없음"** 으로 판정했다.

**두 곳이 같은 질문("이 CLAUDE.md 에 REAP 섹션이 있는가")에 다르게 답한다**:

| 판정자 | 기준 | fixture 판정 |
|---|---|---|
| `core/integrity.ts:197` | `claudeMd.includes(".reap/genome/")` — **문자열 포함** | 있음 |
| `init/common.ts:146-153` `detectLegacyReapSection` | `/^(#{1,3}\s+.*REAP.*)/m` — **REAP 을 포함한 마크다운 헤딩** | 없음 |

fixture 는 `.reap/genome/` 문자열은 있으나 REAP 헤딩이 없다. → integrity 는 "있음", ensureClaudeMd 는 "없음".

### 2. 시간순으로 보면 테스트가 먼저였다

| 날짜 | 사건 |
|---|---|
| 2026-03-26 | `cf49673 test: add e2e tests for reap init --repair` — **테스트 도입** |
| 2026-03-30 | `e6e7666 feat(gen-054): CLAUDE.md REAP section template sync` — **marker-hash sync 도입** |

테스트가 4일 먼저 작성됐다. gen-054 가 `ensureClaudeMd` 를 marker/legacy 2단 판정으로 바꾸면서 fixture 가 더 이상 "REAP 섹션 있음"으로 인식되지 않게 됐다.

**즉 (a) 테스트가 낡았다.** backlog 가 제시한 두 갈래 중 (a) 다.

### 3. 그러나 (b) 도 부분적으로 맞다 — 실사용 영향 확인

fixture 가 낡았다고 끝나지 않는다. `detectLegacyReapSection` 이 **헤딩만 보므로**, v0.15 이전에 REAP 헤딩 없이 `.reap/genome/` 참조만 넣어둔 사용자의 CLAUDE.md 는:

- `integrity` → "REAP 섹션 있음" (경고 안 냄)
- `init --repair` → "없음" → **섹션을 append**

실측에서 실제로 append 됐다. 사용자 관점에서는 "이미 REAP 참조가 있는데 또 붙었다"가 된다. 다만:

- 중복 append 는 아니다 — 두 번째 실행부터는 marker 가 생겨 `skipped`
- 기존 내용을 지우지 않는다

→ **일회성이고 파괴적이지 않으므로 구현 변경은 과하다.** 다만 두 판정 기준이 다르다는 사실 자체는 기록할 가치가 있다.

### 4. 이것도 issue #21/#22 와 같은 유형이다

같은 사실을 두 코드가 각자의 방식으로 판정한다:

- #21: 규칙 텍스트가 4곳에 있는데 2곳만 갱신
- #22: 설치 경로를 installer/checker 가 각각 하드코딩
- **본 건: "REAP 섹션 존재" 판정을 integrity/ensureClaudeMd 가 각각 구현**

gen-076 이 #22 를 DI 로 푼 것과 같은 처방이 가능하다 — 판정을 한 곳에 두고 양쪽이 공유. 다만 본 건은 **두 판정의 목적이 다르다**:

| | 묻는 것 | 틀렸을 때 |
|---|---|---|
| integrity | "사용자에게 경고할 만큼 빠졌는가" (느슨) | 불필요한 경고 |
| ensureClaudeMd | "여기에 덮어쓸 섹션이 있는가" (엄격) | 잘못된 위치에 append |

**느슨/엄격이 의도적이라면 통합이 오히려 해롭다.** 이 판단은 본 세대에서 결론 내되, 통합하지 않기로 하면 **왜 다른지를 주석으로 남긴다** — 지금은 아무 설명이 없어 다음 사람이 또 조사한다.

### 5. CI 가 테스트를 돌리지 않는다 (방치의 구조적 원인)

```
.github/workflows/ci.yml → npm ci + npm run build 뿐
```

e2e 1 fail 이 CI 를 막지 않았다. **6세대 방치의 구조적 이유가 이것이다.** 사람이 로컬에서 돌려야 보이고, 보여도 "pre-existing" 으로 넘길 수 있었다.

본 세대가 0 fail 을 만들면 **다음 세대(`릴리즈-자기진단-게이트-...`)에서 테스트를 CI 게이트에 넣을 수 있다.** 순서상 본 세대가 선행 조건이다.

## Previous Generation Reference

gen-076 이 #22 를 해결하며 얻은 것이 그대로 적용된다 — "같은 사실을 여러 곳이 안다"는 유형 인식, 그리고 **판정 근거를 코드/git 에서 확정하는 방식**(자기모순 발견, `git log -S` 추적). 본 세대도 같은 방법으로 (a)/(b) 를 판정했다.

## Backlog Review

pending 6건. 유저 지시 순서: 본 세대 → `릴리즈-자기진단-게이트-...` → `agent-관점-검증-층2` → 0.17.3 릴리즈. interview/daemon 3건은 이번 묶음에서 제외.

## Context for This Generation

### Clarity Level: **High**

원인이 실측 + git 타임라인으로 확정됐다. 판단이 필요한 것은 "통합할 것인가"뿐이며, 그 판단 재료(두 판정의 목적 차이)도 확보됐다.

### 특수 제약

- **0.17.3 묶음의 일부** — 릴리즈 노트는 3건 완료 후 일괄 보강. 본 세대에서 노트를 건드리면 다음 세대와 충돌
- **버전 bump 없음** — 이미 0.17.3
- 본 세대 완료 시 **e2e 0 fail** 이 되어야 다음 세대가 CI 게이트를 걸 수 있다
