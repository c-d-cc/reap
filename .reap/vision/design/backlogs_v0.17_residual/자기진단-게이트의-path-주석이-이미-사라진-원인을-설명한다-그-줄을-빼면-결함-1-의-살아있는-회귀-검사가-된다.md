---
type: task
status: pending
priority: low
createdAt: 2026-08-20T13:05:28.541Z
---

# 자기진단 게이트의 PATH 주석이 이미 사라진 원인을 설명한다 — 그 줄을 빼면 결함 1 의 살아있는 회귀 검사가 된다

## Problem

`scripts/check-self-diagnosis.sh` 의 § 2·§ 8 은 tarball 설치를 `PATH="$PREFIX/bin:$PATH"` 로
수행한다. gen-088 이 넣은 것이고, 주석(대략 104~112행)과 FAIL 힌트(대략 130행)가 그 이유를
**"postinstall 이 `reap --version` 으로 PATH 의 reap 을 읽기 때문"** 이라고 설명한다.

**gen-092 가 그 원인을 없앴다.** `getInstalledVersion()` 은 더 이상 PATH 를 읽지 않는다.
따라서 그 설명은 이제 **역사**이지 현재 동작의 근거가 아니다.

## Solution

두 갈래이고 **묶여 있다**:

1. **주석만 갱신** — sha 단언은 그대로 둔다. **원인이 아니라 성질을 검사**하므로 다음에 무엇이
   원인이 되든 유효하다 (gen-088 이 그렇게 설계했고 gen-092 도 그 판단을 유지했다).
   PATH 줄도 그대로 둔다 — "실제 전역 설치와 같은 조건"이라는 근거는 원인과 무관하게 참이다.
2. **PATH 줄을 뺀다** — 그러면 § 2 는 **결함 1 의 살아있는 회귀 검사**가 된다: 격리 prefix 의
   bin 이 PATH 에 없으므로, `getInstalledVersion()` 이 다시 PATH 를 읽게 되는 날 sha 단언이
   깨진다.

**2번을 고르려면 먼저 재현 조건을 확인해야 한다.** gen-092 시점에는 확인할 수 없었다 —
전역 reap 0.17.5 와 npm latest 0.17.5 가 같아서 **옛 코드였어도 `up-to-date` 로 skip** 했다.
즉 "PATH 줄을 빼면 red 가 된다"를 **입증할 수 없는 상태**였고, 입증 없이 검사를 바꾸면
gen-078 이 거짓 사례를 5세대 동안 남긴 것과 같은 일이 된다.

재현 조건: **작업 트리 버전이 npm latest 와 같고, PATH 의 reap 이 latest 와 다를 것.**
0.17.6 발행 후 전역을 0.17.5 로 두면 성립한다. 그때 (a) PATH 줄을 빼고 (b) `getInstalledVersion`
을 옛 구현으로 되돌려 **red 를 실제로 확인한 뒤** 결정할 것.

## Files to Change

- `scripts/check-self-diagnosis.sh` — § 2 의 PATH 줄과 그 주석, § 8, FAIL 힌트
