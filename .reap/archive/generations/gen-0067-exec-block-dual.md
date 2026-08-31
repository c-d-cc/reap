---
id: gen-0067-exec
slug: block-dual
type: exec
milestone: ms-014
title: 차단 이중화 — floor 필드와 배포 정책
startedAt: 2026-08-30T23:56:36Z
startCommit: 9299c11
status: closed
closedAt: 2026-08-30T23:56:54Z
endCommit: 62fdca7
---
## Intent

ms-014 task 2 — v0.18 package.json에 `reap.autoUpdateMinVersion: "0.18.0"`(0.17 사용자용 신호), 배포 정책 문서(latest 금지·next 태그·승격 별도 결정) 신설. 끝은 필드+문서+회귀 무결.

## Outcome

v0.18에 floor 필드(package.json `reap.autoUpdateMinVersion: "0.18.0"`)와 `docs/release-policy.md`(latest 금지·next 태그·승격 별도 결정·발행 체크리스트 — version bump 모순 경고 포함). bun test 172 회귀 없음.

## References

- reap v0.18: 직전 feat 커밋 (git log가 안다)
