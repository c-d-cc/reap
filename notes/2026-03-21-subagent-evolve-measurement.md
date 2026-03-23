# Subagent Evolve 측정 결과

> 2026-03-21 측정. gen-082 (single agent) vs gen-083 (subagent 위임) 비교.

## 실험 조건

| 항목 | gen-082 (Single Agent) | gen-083 (Subagent) |
|------|----------------------|-------------------|
| Goal | Migration Agent 구현 | E2E 테스트 추가 |
| 복잡도 | 중 (3 신규 파일 + 2 수정) | 중-소 (1 신규 테스트 파일) |
| 실행 방식 | parent session에서 직접 evolve | parent가 Agent tool로 위임 |

## Context 소모량

### gen-082: Single Agent (직접 실행)

| 구성 요소 | 추정 토큰 |
|-----------|----------|
| System prompt + REAP + Genome | ~8,000 |
| 사전 대화 (평가 논의 + 리서치) | ~6,000 |
| Skill content (6회 로드) | ~12,000 |
| File reads (genome + source + templates) | ~8,000 |
| Subagent 결과 (Explore) | ~3,000 |
| Tool 호출/결과 (Write, Edit, Bash) | ~5,000 |
| AI 응답 | ~4,000 |
| **합계** | **~46,000** |

**Parent session에 남은 context**: ~46,000 tokens (전부 누적)

### gen-083: Subagent 위임

| 구성 요소 | Subagent 내부 | Parent에 남은 것 |
|-----------|-------------|-----------------|
| Total tokens (API 보고) | 39,020 | ~800 (결과 요약) |
| Tool calls | 37 | 1 (Agent 호출) |
| Files read | 16 | 0 |
| Files written/edited | 8 | 0 |
| Commands executed | 5 | 0 |
| Duration | 184초 (~3분) | 대기 |

**Parent session에 남은 context**: ~800 tokens (결과 요약만)

## 비교 분석

### Parent Context 누적량 (연속 generation 시뮬레이션)

| Generations | Single Agent | Subagent 위임 | 절감율 |
|-------------|-------------|--------------|--------|
| 1 gen | ~46K | ~15K (base) + ~0.8K | — |
| 3 gen | ~130K+ | ~15K + ~2.4K | **87%** |
| 5 gen | ~220K+ | ~15K + ~4K | **91%** |
| 10 gen | ~450K+ | ~15K + ~8K | **95%** |

- "base ~15K" = system prompt + genome + 사전 대화 (고정)
- subagent 결과 요약은 generation당 ~800 tokens

### System Prompt Drift 위험

| 시점 | Single Agent | Subagent 위임 |
|------|-------------|--------------|
| 1 gen 후 | 낮음 (4.6%) | 없음 |
| 3 gen 후 | 중간 (~13%) | 없음 |
| 5 gen 후 | 높음 (~22%) | 없음 |
| 10 gen 후 | 매우 높음 (~45%) | 없음 |

참고: 60% context 활용 시점에서 품질 저하 관찰 보고 있음 (외부 벤치마크).
Subagent 위임 시 parent는 항상 ~2% 이하를 유지하므로 drift 없음.

### 품질 관찰

- **Artifact 품질**: subagent가 생성한 objective, planning, implementation, validation, completion artifact가 모두 REAP 템플릿 형식에 정확히 맞음
- **테스트 결과**: 159 → 163 pass (4개 신규 테스트 정상 추가)
- **Genome 준수**: subagent가 conventions.md, constraints.md를 정확히 따름
- **사용자 피드백**: "훨씬 만족스럽다"

### 비용 트레이드오프

| 항목 | Single Agent | Subagent 위임 |
|------|-------------|--------------|
| 총 토큰 소모 (1 gen) | ~46K | ~40K (subagent) + ~0.8K (parent) ≈ ~41K |
| 총 토큰 소모 (3 gen) | ~130K | ~120K + ~2.4K ≈ ~122K |
| 비용 차이 | baseline | **~-6% (오히려 절감)** |

예상과 달리 subagent 방식이 총 토큰도 약간 절감됨.
이유: parent session의 context가 짧아 매 turn의 input tokens가 줄어들기 때문.

## 결론

Subagent 위임 evolve는:
1. **Parent context 88~95% 절감** → system prompt drift 완전 해소
2. **총 비용 미증가** (오히려 소폭 절감)
3. **Artifact 품질 동등 이상** (fresh context에서 시작하므로 instruction 준수율 높음)
4. **Generation 간 일관성 보장** (parent가 항상 가벼운 상태 유지)

autoSubagent 모드의 기본값 true가 합리적인 근거가 됨.
