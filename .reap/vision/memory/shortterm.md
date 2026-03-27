# Shortterm Memory

## 세션 요약 (2026-03-27)

### gen-042: reap update CLI 명령 구현
- `reap update` CLI 명령 추가 (v0.15 -> migrate 위임, v0.16 -> 프로젝트 동기화)
- config backfill, 디렉토리 보충, CLAUDE.md 보수 기능
- `/reap.update` skill을 `reap update` 호출로 변경
- e2e 테스트 5개 추가 -> 411 pass

### 다음 세션에서 할 것
- postinstall에서 `reap update` 자동 실행 검토 (현재 수동)
- docs 페이지에 environment resources/docs 설명 추가
- README v0.16 재작성

### Backlog 상태
- reap update CLI 명령: 이번 gen에서 소비 예정

### 미결정 사항
- Embryo -> Normal 전환 시점
- postinstall에서 reap update 자동 실행 여부
