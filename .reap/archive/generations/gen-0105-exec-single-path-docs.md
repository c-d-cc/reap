---
id: gen-0105-exec
slug: single-path-docs
type: exec
milestone: ms-025
title: 배포 정책·문서를 설치 경로 하나(npm → reap setup)와 latest 직접 발행으로
startedAt: 2026-09-05T01:14:36Z
startCommit: 2ef93e2
status: closed
closedAt: 2026-09-05T01:18:14Z
endCommit: a919404
---

## Intent

ms-025 tasks/2·3. 사람 결정(2026-09-05) 둘 — 설치 경로는 npm 하나(`npm i -g @c-d-cc/reap` → `reap setup`), 0.18.0은 `next` 없이 latest로 — 을 배포 워크플로·정책 문서·발행 절차·사용자 문서(README en/ko·사이트·RELEASE_NOTES)·훅 안내·migrate 2/8·genome에 반영한다. 0.17.8 이행 다리는 발행하지 않는다(latest 직접 발행이면 아무에게도 닿지 않는다). 0.17 사용자의 길은 "blocked 메시지의 명령 → `reap setup` → 새 세션 → `/reap:migrate`"이고 옛 훅이 부르는 `reap load-context`에 0.18이 그 셋을 답한다(gen-0104).

끝나는 조건: `grep -rn '@next'`가 리포(archive·inherited·loop 기록 제외)에서 0건, release.yml에 `--tag next` 없음, 게이트(check-docs-surface·check-release-version·hook.test·check-docs-prerender) 통과. 사이트 문구는 ms-022 검수 중인 `ko.ts`와 같은 파일이라 바꾼 자리를 보고에 명시한다.

## References

- ms-025 milestone.md Background · gen-0104 Outcome(shim 문구)
- `docs/release-policy.md`(개정 전) — `next`의 근거였던 0.17 check-version의 latest 자동 설치와 floor

## Outcome

commit a919404. 게이트: check-docs-surface ok · check-release-version ok · hook.test 통과 · check-docs-prerender PASSED(30쪽) · doctor 결함 0. 플러그인 재설치(캐시 = 작업 트리).

- release.yml: `npm publish --access public`(latest). release-policy.md 재작성(latest 직접·floor가 안전장치·0.17 사용자의 길·0.17.8 은퇴). 06-release 순서 재작성(reap-test → push → 태그 → 마켓플레이스 → main merge), 05-open Q6, 04-migrate-docs·02-distribution 정합, versionBump 스킬 정합
- README en·ko Install: `npm i -g @c-d-cc/reap` + `reap setup` 두 줄. "Coming from v0.17" 재작성. RELEASE_NOTES·site/release-notes-content: Changed 첫 항목·Coming·Good to know
- 사이트 `ko.ts` 바꾼 자리(ms-022 검수 중인 파일): hero installStep1·installNote(783·785) · intro whatBuilds(815) · v018change 표 한 행(891) · quickStart 설치 4문구(932~936) · skill 표 migrate when(1799) · migration intro·updateCode·handoffDesc(1992~1995) · releaseNotes changed 첫 항목·comingDesc·goodToKnow 첫 항목(2053·2069·2072줄). HeroPage.tsx 설치 코드 블록
- 훅 안내·migrate 2/8: `npm i -g @c-d-cc/reap && reap setup`. migrate description에서 upgrade agent 언급 제거. genome application.md 설치 문단
- `@next` 잔존: 계획 기록(01-gap 표·02-distribution 실측·05-open Q6 문제 서술)뿐 — 이력이라 둔다. 사용자 문서·워크플로·플러그인은 0건

## Dead Ends

- 사이트 migration 페이지를 합니다체로 고쳐 쓰는 것 — 그 페이지의 이웃 문장이 전부 한다체(gen-0099, 검수 중)라 한 페이지 안에서 섞이지 않게 이웃을 따랐다. 톤은 ms-022 검수의 몫
