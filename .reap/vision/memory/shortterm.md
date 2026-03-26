# Shortterm Memory

## 세션 요약 (2026-03-26)

### gen-035: Memory 갱신 criteria 통합
- Memory 갱신을 reflect phase 워크플로우에 통합
- tier별 구체적 criteria 명시 (Shortterm 필수/Midterm 맥락변경/Longterm 교훈/갱신금지 항목)
- 5곳 일관 반영: completion.ts, genome evolution.md, 템플릿 evolution.md, reap-guide.md, prompt.ts
- e2e 테스트 1개 추가, 전체 351 tests 통과

### 다음 세션에서 할 것
- Memory criteria가 실제로 갱신을 유발하는지 관찰
- Embryo → Normal 전환 논의 (34+ generations 경과)
- README v0.16 재작성

### 미결정 사항
- Embryo → Normal 전환 시점
- 동일 criteria 5곳 수작업 반영 → 단일 소스화 검토 필요 여부

### 현재 backlog 상태
- pending backlog 없음

### 현재 테스트 현황
351 tests (unit 206 + e2e 104 + scenario 41)
