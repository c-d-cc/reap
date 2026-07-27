# Learning

## Project Overview

REAP v0.17.3 (미릴리즈), embryo generation 78. 0.17.3 묶음 **2/3**.

본 세대는 개별 버그 수정이 아니라 **issue #21/#22 가 같은 유형으로 반복된 것에 대한 구조적 대책**이다.

## Source Backlog

`릴리즈-자기진단-게이트-carrier-원칙-재설계-issue-2122-재발-방지.md` (consumed by gen-078-f00d1b)

유저 결정(2026-07-27) 4건이 확정된 상태:
- 자기진단을 **CI 에도** 포함
- carrier 는 열거 대신 **파일 내 표식(canary token)**
- 격리는 `HOME`/`--prefix` override + `npm pack` (OpenShell 은 층2 로 이월)
- **층 1 만** 이번 범위 (층 2 는 분리된 backlog)

## Key Findings

### 1. 선행 조건 2건이 모두 충족됐다

| 조건 | 달성 |
|---|---|
| `fix --check` 경고 0 | gen-076 (issue #22 해결) |
| 테스트 0 fail | gen-077 (e2e 272-0) |

**"경고 0" 을 게이트로 걸려면 지금이 유일하게 좋은 시점이다.** 몇 세대 지나 경고가 다시 쌓이면 게이트를 걸 수 없다(걸어도 우회하게 된다).

### 2. ⚠️ CI 가 테스트를 못 돌린 진짜 이유 — private submodule

```
.gitmodules:  tests → https://github.com/c-d-cc/reap-test.git
gh repo view c-d-cc/reap-test → "isPrivate": true
```

`.github/workflows/ci.yml` 의 job 이름은 `test` 인데 실제로는 `npm ci` + `npm run build` 만 돌린다. 그 이유가 드러났다 — **`tests/` 가 private submodule 이고, `actions/checkout@v4` 는 기본적으로 submodule 을 가져오지 않으며, 가져오려 해도 기본 `GITHUB_TOKEN` 으로는 다른 저장소에 접근할 수 없다.**

gen-077 은 "CI 가 테스트를 안 돌린다"까지만 봤고 **왜 안 돌리는지**는 보지 않았다. 이 제약이 본 세대의 설계를 바꾼다:

| 검사 | CI 가능? | 근거 |
|---|---|---|
| `check-docs-version.sh` | ✅ | 소스 트리만 읽음 |
| **자기진단** (`install → init → fix --check`) | ✅ | 빌드 산출물 + CLI 만 필요. **tests/ 불필요** |
| **테스트 실행** | ❌ (현 상태) | private submodule 접근 토큰 필요 |

**즉 "테스트를 CI 에 넣자"는 별도 문제다.** 자기진단은 tests/ 없이 가능하므로 본 세대 범위이고, 테스트 CI 추가는 PAT 발급·secret 설정이 필요해 유저 결정 사항이다.

### 3. 자기진단이 잡을 수 있는 것 (과거 사고 대조)

| 사고 | 자기진단이 잡았겠는가 |
|---|---|
| #22 (install-skills ↔ fix --check 불일치) | **잡는다** — `install-skills` 후 `fix --check` 경고 0 조건에 정확히 걸림 |
| gen-074 daemon 배포 결함 (`files` 에 daemon/ 누락 → 끊긴 심링크) | **잡는다** — `npm pack` 후 실제 설치하므로 |
| #21 (규칙 텍스트 미갱신) | 못 잡음 — 텍스트 내용은 검사 대상이 아님. canary token 의 영역 |
| gen-063 (slash command 가 안 뜸) | 못 잡음 — agent 실행 필요. 층 2 |

**2건을 잡는다.** 이것이 게이트의 유효성 근거이며, 못 잡는 2건은 각각 다른 대책(canary token / 층2)이 담당한다.

### 4. carrier canary token — 초기 대상 확인

backlog 가 제시한 2개 외에 gen-077 에서 세 번째 유형이 확인됐다:

| carrier ID 후보 | 아는 곳 | 유형 |
|---|---|---|
| `claude-code-commands-path` | adapter(소유) / README / docs 5로케일 | 값 — **gen-076 이 DI 로 축소** |
| `memory-tier-classification` | reap-guide / evolution 템플릿 / reflect prompt / docs 5로케일 / migration note | 텍스트 |
| **`ensure-claude-md-outcomes`** | `ensureClaudeMd` 반환 union / `repair.ts` 분기 | **반환값 union** (gen-077) |

세 번째는 backlog 작성 시점에 없던 종류다. **"열거는 새 종류를 못 잡는다"는 backlog 의 논지가 backlog 자신에게도 적용됐다** — 표식 방식이 옳다는 방증이다.

### 5. npm scripts 는 이미 갖춰져 있다

```
test:unit / test:e2e / test:scenario / test (셋 합)
build / typecheck
```

자기진단 스크립트는 이들과 **별개**여야 한다 — tests/ 에 의존하지 않고 빌드 산출물만 쓴다.

## Previous Generation Reference

gen-076(#22)·gen-077(init-repair) 이 각각 "한쪽만 갱신됨"의 2·3번째 사례를 남겼다. 본 세대는 그 패턴 자체를 다룬다.

gen-073 이 만든 `check-docs-version.sh` 가 릴리즈 게이트의 선례이며, **CI 에는 넣지 않았다**(개발 중 package.json 이 문서보다 앞서는 것이 정상이라 상시 red). 자기진단은 그런 성질이 없어 CI 에 넣을 수 있다는 것이 유저 판단이다.

## Backlog Review

pending 4건. 본 세대 후: `agent-관점-검증-층2`(3/3) → 0.17.3 릴리즈. interview/daemon 3건은 묶음 제외.

## Context for This Generation

### Clarity Level: **High**

유저 결정 4건이 확정됐고 선행 조건도 충족됐다. 다만 **§2(private submodule)가 backlog 작성 시점에 몰랐던 제약**이므로, "테스트를 CI 에 넣는다"는 항목은 범위 재조정이 필요하다.

### 특수 제약

- **게이트를 걸기 전에 통과 상태여야 한다** — 현재 경고 0 이므로 충족. 남겨두고 게이트만 걸면 우회하게 되어 지금보다 나빠진다
- **먼저 실패시켜라** (gen-073) — 스크립트를 만든 뒤 "지금 통과함"만 보면 검사가 실제로 동작하는지 알 수 없다. 의도적으로 깨뜨려 fail 을 확인할 것
- **0.17.3 묶음** — 릴리즈 노트는 3/3 완료 후 일괄. 본 세대에서 건드리면 충돌
- **genome carrier 절 재작성** 포함 — adapt phase 에서 수행 (genome 수정이므로)
