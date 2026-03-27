# Shortterm Memory

## 세션 요약 (2026-03-27)

### gen-045: strictEdit/strictMerge 구현
- config.yml의 `strict: boolean` → `strictEdit: boolean` + `strictMerge: boolean` 분리
- `buildStrictSection()` — v0.15 HARD-GATE 로직 이식 (prompt.ts)
- `buildBasePrompt()`에 config 파라미터 추가, strict 섹션 주입
- update.ts: legacy strict 자동 변환, migrate.ts: v0.15 strict 변환
- integrity.ts: 새 필드 검증 + legacy 경고
- 452 pass (기존 435 + 17 신규)

### 다음 세션에서 할 것
- update 명령의 strict 변환 e2e 테스트
- skill 파일에 strict mode 가이드 추가 검토
- README v0.16 재작성

### Backlog 상태
- strictEdit/strictMerge task: 이번 generation에서 처리 완료 (consumed 예정)

### 미결정 사항
- Embryo -> Normal 전환 시점
- 다국어 맵의 공통 i18n 모듈 분리 시점
