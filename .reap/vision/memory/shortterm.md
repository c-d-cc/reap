# Shortterm Memory

## 세션 요약 (2026-03-27)

### Agent 전략 리팩토링 (generation 외 작업)
- **결정**: 매번 새 agent 생성 (cruise 포함). 연속성은 memory/artifact로 보장.
- **reap-evolve.md 리팩토링 완료**:
  - Role 부여: "한 세대를 책임지는 개발자"
  - reap-guide.md와 중복 제거 — guide가 "what/how", agent 정의가 "role/mindset/behavior"
  - MANDATORY 파일 읽기 목록 (reap-guide + genome 3개 + environment + vision goals)
  - Agent mindset: artifact는 handoff, memory는 cross-gen context, workflow는 signature 강제
- **buildBasePrompt() 슬림화**: 정적 규칙 제거, 동적 context만 생성
- **evolve.ts**: `subagent_type: "reap-evolve"` 지시 추가
- **reap-researcher.md 삭제**: Explore subagent으로 충분
- **cruise loop에 knowledge re-read 단계 추가**
- 테스트: 390 pass (unit 223, e2e 126, scenario 41)

### 다음 세션에서 할 것

#### 1. Cruise mode 구조 변경
- 현재: 하나의 agent가 여러 generation 연속 실행 (context 쌓임)
- 목표: parent가 cruise loop 관리, generation마다 새 agent 생성
- prompt.ts의 cruise loop 로직을 parent 측으로 이동 필요

#### 2. 남은 개발
- README v0.16 재작성
- spec2.md 최신화
- STAGE_ARTIFACTS 맵 중복 정의 해소

#### 3. Migration 후속
- 다른 머신에서 migration 후 generation 품질 관찰
- reap-evolve agent 사용 시 실제 output 품질 검증

### 미결정 사항
- Embryo → Normal 전환 시점
- cruise mode 리팩토링 구체 설계
