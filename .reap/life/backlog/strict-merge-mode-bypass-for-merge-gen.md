---
title: Merge generation에서 strict merge mode 자동 bypass
priority: high
created: 2026-03-29
---

## 문제

gen-052 merge generation에서 subagent가 실제 `git merge`를 실행하지 못함.
원인: strict merge mode가 merge stage에서도 git merge를 차단.
결과: REAP artifacts만 업데이트되고 실제 git merge는 미수행, push 실패.

## 기대 동작

Merge generation의 merge stage에서는 strict merge mode가 자동으로 bypass되어야 한다.
Merge generation 자체가 git merge를 수행하기 위한 것이므로 차단은 모순.

## 수정 방향

- `buildBasePrompt()`에서 merge generation + merge stage일 때 strict merge HARD-GATE를 제거하거나 bypass 안내 포함
- 또는 strict merge section 생성 시 generation type을 체크하여 merge gen이면 git merge 허용 문구 추가
