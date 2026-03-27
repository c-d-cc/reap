# Shortterm Memory

## 세션 요약 (2026-03-27)

### gen-048: release notice 구현
- `src/core/notice.ts` 신규: fetchReleaseNotice(version, language) — RELEASE_NOTICE.md에서 버전+언어별 노트 추출
- `RELEASE_NOTICE.md` 패키지 루트에 생성 (v0.16.0 en/ko)
- `check-version.ts`: autoUpdate 성공 후 notice stderr 출력
- `update.ts`: update 완료 후 notice stderr 출력
- `package.json`: files에 RELEASE_NOTICE.md 추가
- 464 pass (기존 456 + 8 신규)

### 다음 세션에서 할 것
- update 명령의 strict 변환 e2e 테스트
- reap-guide.md에 `reap config` CLI 명령 추가 검토
- README v0.16 재작성

### Backlog 상태
- release notice task: 이번 generation에서 처리 완료
- 남은 pending: auto issue report

### 미결정 사항
- Embryo -> Normal 전환 시점
- 다국어 맵의 공통 i18n 모듈 분리 시점
- 새 버전 릴리즈마다 RELEASE_NOTICE.md 갱신 체크리스트화 여부
