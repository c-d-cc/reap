---
id: gen-0120-exec
slug: v017-path-truth
type: exec
backlog: bk-1dcea1
title: 0.17 사용자의 길을 사실대로
startedAt: 2026-09-12T06:44:39Z
startCommit: 21822a8
status: open
---

## Intent

bk-1dcea1을 소비한다. **"세션 시작 시 버전 검사가 안내한다"는 서술을 출시 문서에서 지운다.** 그 일은 일어나지 않는다 — v0.17이 심는 훅 두 줄이 `2>/dev/null`이고 `check-version.ts`의 출력 호출 넷이 전부 `console.error`다(2026-09-12 실측).

틀렸다는 것보다 **읽는 사람을 반대로 보낸다**는 것이 문제다. "검사가 알려준다"를 읽으면 "가만히 있으면 되겠구나"가 결론인데, 실제로는 스스로 치는 것 말고 길이 없다. v0.17 사용자에게 v0.18로 가는 길을 알려주는 유일한 자리가 그 절이다.

처방이 정해져 이제 쓸 수 있다. **0.17 쪽에서는 아무것도 발행하지 않는다**(사람 결정 2026-09-12, reap-v17 세션). 확성기 안과 하한값 낮추기 안이 함께 떨어졌고 `autoUpdateMinVersion`은 0.18.0 그대로다. 규모(주간 다운로드 25 남짓)를 근거로 공백을 받아들인 결과다.

### 고칠 자리

| 파일 | 무엇 |
|---|---|
| `README.md` · `README.ko.md` | "v0.17에서 왔다면" 절 첫 문장 |
| `RELEASE_NOTES.md` | 0.18.0의 `### Coming from v0.17`, 그리고 `Good to know`의 같은 서술 |
| `site/release-notes-content.md` | 같은 문장 |
| `site/src/i18n/translations/ko.ts` | `intro`·`comingDesc` 두 곳 |
| `docs/release-policy.md` | "0.17 사용자의 길" 1단계와 그 앞 절의 단정 한 줄 |

바꾸는 것은 **진입 조건 하나**다. "검사가 안내한다" → "세션 안에서는 알려주지 않는다. v0.17을 쓰고 있다면 직접 친다." 그 뒤 세 단계(`reap setup` → 새 세션 → `/reap:migrate`)는 그대로 유효하다.

### 끝나는 조건

1. 위 자리 전부에서 "세션 시작 시 안내가 온다"는 서술이 사라진다
2. 각 자리가 사용자 관점에서 무엇을 해야 하는지 말한다 — 기제 설명이 아니라
3. 사이트 en·ko가 같은 사실을 말한다
4. `scripts/check-docs-surface.sh` 게이트 통과
5. `docs/release-policy.md`가 코드가 하는 일만 적고, 공백이 받아들여진 결정임을 적는다

### 경계 밖

- 0.17 쪽 발행 — 안 한다로 확정. 이 리포의 일이 아니다
- `06-release.md`의 reap_v17 절이 지워진 워킹 카피를 가리키는 것 — 같이 고친다(한 줄)
- opencode 사용자 안내 — 아직 항목 없음

### References

- bk-1dcea1 · gen-0119(탐지) · `lessons.md`의 "문서가 단정한 동작은 출력이 어디로 나가는지까지 확인한다"
- 사람 결정 2026-09-12: 0.17 쪽 미발행, 공백 수용 (reap-v17-82 세션 경유)
