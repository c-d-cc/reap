# 4 — 검증

- v0.18: bun test·hook.test.sh·typecheck·build 회귀 없음, package.json 필드·정책 문서 존재, 03-compat.md에 미결 표 없음
- main: 전체 스위트 통과, 다리 동작(캐시 1일 1회·next 안내·update 경로·네트워크 실패 중단) 테스트 존재 확인
- npm 레지스트리에 아무것도 발행되지 않았음을 `npm view @c-d-cc/reap versions | tail`로 확인 (0.17.7이 마지막)
