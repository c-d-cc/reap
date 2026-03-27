# Shortterm Memory

## 세션 요약 (2026-03-27)

### gen-044: reap help 고도화
- help.ts 전면 재작성: 다국어 맵(en/ko/ja/zh-CN), 토픽 모드, 상태 표시, 미지원 언어 AI 번역 위임
- index.ts: `help [topic]` 인자 지원 추가
- reap.help.md skill: topic 전달 안내 추가
- unit test 24개 추가 → 435 pass

### 다음 세션에서 할 것
- help e2e 테스트 추가 검토
- auto-update 결과를 SessionStart 출력에 반영하는 연동 검토
- README v0.16 재작성

### Backlog 상태
- 현재 pending backlog 없음

### 미결정 사항
- Embryo -> Normal 전환 시점
- 다국어 맵의 공통 i18n 모듈 분리 시점
