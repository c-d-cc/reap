# Shortterm Memory

## 세션 요약 (2026-03-27)

### gen-047: hand-off 구현 — 업그레이드 후 새 바이너리 위임
- `handOffToNewBinary()` 추가: npm install 성공 후 `reap update --post-upgrade`로 새 바이너리에 위임
- `update.ts`에 `--post-upgrade` 플래그 지원 추가
- 456 pass (기존 454 + 2 신규)

### 다음 세션에서 할 것
- update 명령의 strict 변환 e2e 테스트
- reap-guide.md에 `reap config` CLI 명령 추가 검토
- README v0.16 재작성

### Backlog 상태
- hand-off task: 이번 generation에서 처리 완료
- 남은 pending: auto issue report, release notice

### 미결정 사항
- Embryo -> Normal 전환 시점
- 다국어 맵의 공통 i18n 모듈 분리 시점
