# Shortterm Memory

## 세션 요약 (2026-03-27)

### gen-046: reap config CLI + skill 정비
- `reap config` CLI 명령 신규 구현 (src/cli/commands/config.ts)
- 3개 skill 정비: reap.config, reap.status, reap.run — disable-model-invocation 제거 + AI 안내 추가
- 454 pass (기존 452 + 2 신규)

### 다음 세션에서 할 것
- update 명령의 strict 변환 e2e 테스트
- reap-guide.md에 `reap config` CLI 명령 추가 검토
- config.yml legacy 필드 정리 (strict → strictEdit/strictMerge 등)
- README v0.16 재작성

### Backlog 상태
- reap config CLI task: 이번 generation에서 처리 완료

### 미결정 사항
- Embryo -> Normal 전환 시점
- 다국어 맵의 공통 i18n 모듈 분리 시점
