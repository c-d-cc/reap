# Shortterm Memory

## 세션 요약 (2026-03-26 ~ 2026-03-27)

gen-020 ~ gen-038 (19 generations) + 다수 generation 외 작업 완료.

### 주요 작업
- v0.15 패리티: hooks, install-skills, fix, destroy, clean, prompt→CLI 이전
- Self-evolving: gap-driven, vision eval, memory 3-tier, clarity, cruise, memory workflow
- Migration: v0.15→v0.16 구현 + alpha publish + 실제 테스트 + legacy cleanup
- Infra: build script 분리, alpha-publish, agent 정의 파일, version 동적 로딩
- 정합성: artifact-check, integrity에 reap-guide/memory/CLAUDE.md 체크 추가

### 다음 세션에서 할 것

#### 1. Agent 정의 파일 적용 검토
- `.claude/agents/reap-evolve.md`, `reap-researcher.md` 생성 완료
- reap-evolve agent로 generation 실행 테스트
- subagent prompt 경량화 효과 검증
- evolve.ts에서 agent 정의를 활용하도록 수정할지 결정

#### 2. Migration 후속
- 다른 머신에서 migration 후 generation 품질 관찰
- reap-guide.md 복사, legacy cleanup, domain 파일 migration 동작 확인

#### 3. 남은 개발
- README v0.16 재작성
- spec2.md 최신화 (현재와 괴리 큼)
- STAGE_ARTIFACTS 맵 중복 정의 해소

#### 4. 프로세스 반성
- generation 없이 작업한 건 (subagent prompt 슬림화) — lifecycle 준수 필요
- Embryo → Normal 전환 논의

### 미결정 사항
- Embryo → Normal 전환 시점
- subagent prompt에서 guide를 완전히 빼는 것이 적절한지 (품질 저하 관찰 필요)
- reap-evolve agent 정의를 evolve.ts에 통합할지, 별도로 유지할지

### 현재 테스트 현황
349 tests (unit 223 + e2e 126)
