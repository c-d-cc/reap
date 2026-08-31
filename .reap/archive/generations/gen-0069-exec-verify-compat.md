---
id: gen-0069-exec
slug: verify-compat
type: exec
milestone: ms-014
title: 검증 — ms-014 Exit Criteria
startedAt: 2026-08-31T00:01:52Z
startCommit: e1c2b9b
status: closed
closedAt: 2026-08-31T00:04:58Z
endCommit: 838b219
---
## Intent

ms-014 task 4 — v0.18 배터리(test·hook·tsc·build·floor·정책 문서), main 전체 스위트(e2e·scenario 포함), 03-compat 미결 표 부재, npm 미발행 확인. 끝은 Exit Criteria 5개 전부.

## Outcome

Exit Criteria 5/5:
- v0.18: floor 필드(0.18.0)·release-policy.md 존재, bun test 172·hook·tsc·build 전부 통과
- 03-compat.md 미결 표 소멸 (gen-0066)
- main 363e6e3: 다리 셋 구현 + 새 테스트 11. **전체 스위트** unit 829 · e2e 391 · scenario 62 전부 통과 — e2e는 dist 빌드가 전제라 첫 실행이 336건 전멸했고(`node dist/cli/index.js` 실행 구조), `npm run build` 후 전부 통과. `npm run test` 스크립트가 build를 전제하는 것은 구 리포의 기존 특성
- npm: latest 0.17.7, 발행된 것 없음 (dist-tags 실측 기록)
