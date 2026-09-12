---
id: gen-0120-exec
slug: v017-path-truth
type: exec
backlog: bk-1dcea1
title: 0.17 사용자의 길을 사실대로
startedAt: 2026-09-12T06:44:39Z
startCommit: 21822a8
status: closed
closedAt: 2026-09-12T06:49:17Z
endCommit: 6857a51
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

## Outcome

일곱 자리에서 "세션 시작 시 버전 검사가 안내한다"를 지웠다. 바꾼 것은 진입 조건 하나이고 그 뒤 세 단계는 그대로다.

| 자리 | 무엇 |
|---|---|
| `README.md` · `README.ko.md` | 절을 다시 썼다 — 설치 명령을 코드 블록으로 올리고, 이주 전까지 v0.18이 옛 저장소를 알아보고 쓰지 않는다는 것(gen-0119)을 덧붙였다 |
| `RELEASE_NOTES.md` · `site/release-notes-content.md` | `Coming from v0.17` 절과 `Good to know`의 같은 서술 |
| `site/src/i18n/translations/ko.ts` | migration의 `intro`·`updateCode` 주석·`handoffDesc`, 릴리스 노트의 `comingDesc`·`goodToKnow[0]` |
| `docs/release-policy.md` | blocked 메시지가 닿지 않는 이유를 코드 위치와 함께 적고, 공백을 받아들인 사람 결정과 결과 둘을 새 절로. "0.17 사용자의 길"은 "손으로 올라온 …"으로 |
| `06-release.md` | 지워진 워킹 카피 대신 원격 `v0.17.8` 브랜치(c0a2bdd) |

문체는 자리마다 이웃을 따랐다 — migration은 합니다체, 릴리스 노트는 한다체다.

검증: `check-docs-surface.sh` 통과, `site:build` 29쪽, `check-docs-prerender.sh` 통과. 프리렌더 산출물에서 새 문구가 실리고 옛 문구가 0건인 것을 migration·release-notes 두 페이지에서 확인했다. 사람 확인 뒤 커밋(docsUpdate 4절).

- summary.md: 해당 없음 — 코드 무변경
- genome: 해당 없음
- 독립 검증 생략 — 문서만

## Dead Ends

**정책 문서만 고치려다 범위를 뒤집었다.** bk-1dcea1은 `release-policy.md` 한 곳으로 등록돼 있었다. 사람이 *"정책문서를 꼭 업데이트 해야하는것인가?"* 라고 물어 분포를 세어보니 같은 문장이 출시 문서 넷에 그대로 있었고, 내부 문서보다 그쪽이 훨씬 무거웠다 — 사용자에게 나가고, 읽는 사람을 반대 방향으로 보낸다. **항목이 가리킨 자리가 그 문제의 전부라고 전제하지 않는다.**

## References

- bk-1dcea1 · gen-0119(탐지) · `lessons.md`의 "문서가 단정한 동작은 출력이 어디로 나가는지까지 확인한다"
- 사람 결정 2026-09-12: 0.17 쪽 미발행, 공백 수용 (reap-v17-82 세션 경유). 근거는 규모 — 주간 다운로드 25 남짓

## 이어지는 것

- **opencode 사용자 안내** — v0.18이 받기로 했으나(reap-v17 세션과 합의) 아직 항목이 없다. 그 사용자들은 어댑터가 `check-version`을 부르지 않아 이미 얼어 있고, 손으로 0.18을 설치하면 `reap setup`이 Claude Code 플러그인을 가리킨다
- `lessons.md`가 안내선을 넘었다(항목 28 · 24). 졸업은 따로
