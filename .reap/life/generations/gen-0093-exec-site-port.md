---
id: gen-0093-exec
slug: site-port
type: exec
milestone: ms-022
title: 사이트 재구축 — v0.17 문서 앱 디자인 그대로, 내용만 v0.18 (ko)
startedAt: 2026-09-04T02:04:58Z
startCommit: 8e3c344
status: open
---
## Intent

사람 검수(2026-09-04): VitePress 사이트 기각 — 기존 reap.cc 디자인·톤 유지, 내용만 v0.18. `~/cdws/reap_v17/docs/` 앱을 `site/`로 옮기고(VitePress 산출물 제거), 페이지를 v0.18 열둘로, 번역은 ko 하나(검수 전). 기존 `site/*.md`(gen-0085·0088의 한국어 본문)를 내용의 원천으로 쓴다. `docs.yml`은 v0.17 것 승계. 끝은 `bun run site:build`(prerender 포함)가 ko 열두 라우트를 내고, `site:dev`로 띄웠을 때 디자인이 reap.cc와 같다.

## Delegation

brief로 subagent에게. worktree `../reap-wt-site`(브랜치 `ms-022-site-port`).
