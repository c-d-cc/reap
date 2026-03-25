---
type: task
status: pending
priority: high
---

# npx @c-d-cc/reap 지원

## Problem
현재 `npm install -g @c-d-cc/reap`로만 설치 가능. `npx @c-d-cc/reap`로 바로 실행/설치할 수 있으면 사용자 경험이 개선됨.

## Solution
- package.json의 bin entry가 이미 `"reap": "dist/cli/index.js"`로 설정되어 있으므로 `npx @c-d-cc/reap`는 이론적으로 동작
- 하지만 npx는 임시 실행이므로, global 설치가 필요한 reap에는 npx 실행 시 global install을 안내하거나 자동으로 처리하는 로직이 필요할 수 있음
- 또는 npx 실행 시에도 skill 등록이 정상 동작하는지 검증 필요

## Files to Change
- package.json — bin, scripts 확인
- src/cli/index.ts — npx 실행 감지 시 동작 정의
- README.md — 검증 후 npx 안내가 실제로 동작하는지 확인

## Note
README에 이미 `npx @c-d-cc/reap`를 첫 번째 설치 옵션으로 기재함. 실제 동작 검증은 npm 배포 후 가능.
