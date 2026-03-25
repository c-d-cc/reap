# Learning — gen-001-399123

## Goal
자기 탐구 — genome/environment/vision 형성

## Project Overview

REAP(Recursive Evolutionary Autonomous Pipeline)는 AI와 인간이 세대를 거치며 소프트웨어를 공동 진화시키는 CLI 도구. v0.16.0은 v0.15의 완전 재작성(complete rewrite)으로, 생물학적 진화 메타포(genome, generation, lineage, fitness, crossover)를 핵심 구조로 채택.

TypeScript + Bun build, yaml v2 단일 dependency, 자체 CLI framework. 18 core modules, 19 command handlers, 18 skills.

## Key Findings

### 1. Genome 상태 — 극도로 빈약했음
- `application.md`: 3줄 설명만 존재
- `evolution.md`: 3줄 원칙만 존재
- `invariants.md`: 3개 규칙 (적절)
- **조치**: application.md를 아키텍처, 메타포 매핑, 컨벤션, 기술 스택 포함하여 풍부하게 재작성

### 2. Environment 상태 — 최소한
- `summary.md`: 3줄 요약만 존재, source-map.md 없음
- **조치**: source structure, build system, test suites, design decisions 포함하여 재작성

### 3. Vision 상태 — 빈 템플릿
- `goals.md`: 주석만 있는 빈 파일
- spec2.md에 상세한 로드맵이 있었으나 goals.md에 반영되지 않음
- **조치**: spec2.md 기반으로 체크리스트 형태의 vision goals 작성 (완료/미완료 구분)

### 4. 코드베이스 성숙도
- Core lifecycle: 완성 상태 (normal + merge 모두 동작)
- Nonce system: 동작 중 (SHA256 기반)
- Compression: 2-level 구현 완료
- E2E tests: 4 suites 존재
- **미완성**: clarity-driven interaction 로직, gap-driven evolution, update agent, self-hosting

### 5. Backlog 검토
- `init-auto-detect-mode.md`: **이미 구현됨** (`detectMode` 함수 존재) → backlog 정리 필요
- `npx-install-support.md`: 검증 필요
- `remove-presets-feature.md`: 코드에 preset 흔적 확인 필요
- `remove-restart-command.md`: restart.ts 존재, abort 통합 대상
- `tests-submodule.md`: 현재 tests/는 .gitignore에 없음, submodule 전환 대상

## Context

- **Generation type**: embryo (첫 generation)
- **Maturity**: bootstrap
- **이 generation의 성격**: 코드 변경 없음. genome/environment/vision 기반 문서를 실제 코드베이스와 일치시키는 자기 탐구(self-exploration) 작업.

## Clarity Level: Medium

- Vision이 이제 존재하지만 이 generation에서 막 작성함
- Backlog은 5개 있으나 일부는 이미 해결됨 (정리 필요)
- Embryo이므로 genome이 아직 안정화되지 않음
- Lineage 거의 없음 (이전 gen-001은 e2e test용)
- 방향은 명확하나 (self-hosting을 향해) 세부 우선순위는 유동적
