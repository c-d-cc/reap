---
id: gen-0105-exec
slug: single-path-docs
type: exec
milestone: ms-025
title: 배포 정책·문서를 설치 경로 하나(npm → reap setup)와 latest 직접 발행으로
startedAt: 2026-09-05T01:14:36Z
startCommit: 2ef93e2
status: open
---

## Intent

ms-025 tasks/2·3. 사람 결정(2026-09-05) 둘 — 설치 경로는 npm 하나(`npm i -g @c-d-cc/reap` → `reap setup`), 0.18.0은 `next` 없이 latest로 — 을 배포 워크플로·정책 문서·발행 절차·사용자 문서(README en/ko·사이트·RELEASE_NOTES)·훅 안내·migrate 2/8·genome에 반영한다. 0.17.8 이행 다리는 발행하지 않는다(latest 직접 발행이면 아무에게도 닿지 않는다). 0.17 사용자의 길은 "blocked 메시지의 명령 → `reap setup` → 새 세션 → `/reap:migrate`"이고 옛 훅이 부르는 `reap load-context`에 0.18이 그 셋을 답한다(gen-0104).

끝나는 조건: `grep -rn '@next'`가 리포(archive·inherited·loop 기록 제외)에서 0건, release.yml에 `--tag next` 없음, 게이트(check-docs-surface·check-release-version·hook.test·check-docs-prerender) 통과. 사이트 문구는 ms-022 검수 중인 `ko.ts`와 같은 파일이라 바꾼 자리를 보고에 명시한다.

## References

- ms-025 milestone.md Background · gen-0104 Outcome(shim 문구)
- `docs/release-policy.md`(개정 전) — `next`의 근거였던 0.17 check-version의 latest 자동 설치와 floor
