# Learning

## Project Overview

REAP v0.16.0 — 자기진화형 개발 파이프라인. 21세대를 거치며 core lifecycle, merge, nonce, compression, hook engine 등이 구현됨. 현재 embryo 단계.

이번 세대 목표: reap-guide.md 작성 + subagent prompt 공통화 (reap 지식 주입 체계 구축)

## Source Backlog

backlog item `reap-guidemd-작성-v16용-reap-도구-가이드-사용자-프로젝트-주입용.md`에서 출발.

**문제**: v15에는 `reap-guide.md`가 있어서 session start hook으로 AI에게 REAP 도구 사용법을 주입했으나, v16에는 이 가이드가 없음. `reap init`한 프로젝트에서 AI가 REAP의 lifecycle, backlog, genome 개념을 알 방법이 없음.

**해결**: v16 구조에 맞는 `src/templates/reap-guide.md` 작성 + subagent prompt에서 이 가이드를 로딩하는 공통 모듈 구축.

## Key Findings

### 1. v15 reap-guide.md 구조 (216줄)
- What is REAP, 3-Layer Model, Genome Structure
- .reap/ 4-Axis Structure, Life Cycle 상세
- Key Concepts (Generation, Backlog, Task Deferral, Micro Loop, Minor Fix, Lineage Compression)
- REAP Hooks 설명
- CLI Subcommands, Role Separation, Execution Flow
- Language, Strict Mode, Critical Rules

### 2. v16과 v15의 주요 차이
- **Stages**: v15 objective → v16 learning (첫 단계명 변경)
- **Genome 파일**: v15 principles/conventions/constraints/source-map → v16 application/evolution/invariants
- **Hook 시스템**: v16은 gen-021에서 포팅한 executeHooks (조건부 실행, 순서 제어)
- **CLI**: v16은 `reap run <stage>` 패턴, `reap make backlog` 등. `reap fix/clean/destroy/help`는 아직 미구현
- **Maturity**: v16은 bootstrap/growth/cruise 시스템 내장
- **Vision**: v16은 `.reap/vision/` 디렉토리 보유
- **Hook 이벤트명**: v15 onLifeObjected → v16 onLifeLearned

### 3. evolve.ts의 buildSubagentPrompt() 구조 (~212줄)
- genome 3파일 + environment + vision을 로딩하여 프롬프트 구성
- Rules, Genome, Environment, Vision Goals, Current State, Lifecycle Execution, Generation Type, Maturity, Validation Rules, Backlog Rules, Echo Chamber Prevention, Collaboration, Clarity-driven Interaction 섹션
- 이 로직이 evolve.ts에 인라인으로 존재 — 재사용 불가

### 4. 경로 패턴 분석
- `template.ts`에서 `import.meta.url` 기반으로 `../templates/` 참조하는 패턴 사용
- `scripts/build.sh`에서 `cp -r src/templates dist/` 자동 복사
- 따라서 `src/templates/reap-guide.md` → `dist/templates/reap-guide.md`로 자동 배포

### 5. ReapPaths 구조
- genome, environment, vision, hooks 등 경로를 모두 포함
- prompt.ts에서 paths를 받아 필요한 파일을 로딩하면 됨

## Previous Generation Reference

gen-021: v15 hook-engine 포팅 완료. executeHooks로 조건부 실행, 순서 제어, 상세 결과 추적 구현. 195개 테스트 통과. 이번 세대에서 hook 관련 설명을 reap-guide.md에 반영해야 함.

## Backlog Review

- `claude-md-migration.md` (task, pending): 기존 reap 프로젝트에 CLAUDE.md 추가. 이번 세대와 직접 관련 없음 — 보류.

## Technical Deep-Dive

### prompt.ts 모듈 설계 방향

현재 `evolve.ts`의 `buildSubagentPrompt()`는:
1. genome 3파일 로딩 (evolve.ts execute()에서)
2. environment/vision 로딩 (evolve.ts execute()에서)
3. prompt 조립 (buildSubagentPrompt 함수에서)

공통화 시:
1. `loadReapKnowledge(paths)` — genome + environment + vision + reap-guide 로딩
2. `buildBasePrompt(knowledge, state, config)` — 공통 프롬프트 조립
3. evolve.ts는 이 함수들을 import하여 사용

reap-guide.md는 REAP "도구" 자체의 사용법이고, genome/environment는 "해당 프로젝트"의 지식. 이 구분이 명확해야 함.

## Context for This Generation

- **Clarity**: High — 목표가 구체적 (v15 참조 존재, 파일 위치/구조 명확)
- **Type**: embryo — genome 수정 가능하나 이번 세대에서는 불필요
- **Constraints**: 기존 evolve.ts의 동작을 깨뜨리지 않으면서 리팩토링해야 함
- **테스트**: prompt 변경은 기능적 영향 있으면 e2e, 없으면 skip (evolution.md 기준). 리팩토링이므로 기존 테스트가 통과하면 충분
