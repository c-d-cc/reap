---
id: gen-0095-exec
slug: site-tone
type: exec
milestone: ms-022
title: 사이트 문구를 reap.cc 톤으로 다시 쓴다 — 합니다체·완결 문장·사용자 관점
startedAt: 2026-09-04T14:06:12Z
startCommit: 4a2d7ea
status: open
---
## Intent

사람 검수(2026-09-04): "reap.cc/ko와 비교하면 로컬 문구가 너무 AI 같다." 원인 — ko.ts가 spec·skill의 "-한다"체 단문, 중점(·)·대시 나열, 설계 근거 서술을 그대로 옮겼다. reap.cc/ko(v0.17 ko.ts)는 "-합니다"체 완결 문장, 사용자 관점의 설명, 용어는 영문 고유명사(Generation·Milestone)로 쓴다. 13쪽 문구 전부를 그 톤으로 다시 쓴다. 키·구조·페이지 JSX는 그대로.

## Delegation

brief로 subagent에게 — 주 트리(dev 서버 5174 유지). `make`·`mark` 금지.
