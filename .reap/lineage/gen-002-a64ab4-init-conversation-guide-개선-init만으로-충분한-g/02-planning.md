# Planning — gen-002-a64ab4

## Goal
init conversation guide 개선 — init만으로 충분한 genome/environment 생성

## Spec

init 후 첫 generation을 시작할 때, genome/environment가 AI가 프로젝트를 이해하고 원칙에 따라 동작하기에 충분한 수준이어야 함. 현재 init은 사실(fact) 확인 중심이고, 설계 원칙(principle)을 이끌어내지 못함.

## Changes

### 1. common.ts — DEFAULT_EVOLUTION 강화
현재 3줄 → 현재 evolution.md 수준의 REAP 운영 원칙을 기본값으로 제공.
(Clarity-driven interaction, Genome 관리 원칙, Echo chamber 방지, Completion 시 환경 갱신)
사용자에게 물어볼 영역이 아님 — REAP이 제공하는 best practice.

### 2. greenfield.ts — Conversation prompt 개선
- Step 2 (Project Identity): "What problem does it solve?" 외에 **"이 프로젝트의 핵심 메타포나 설계 철학은?"** 추가
- Step 4 (Architecture): 사실 확인에서 끝나지 않고 **"왜 이 구조를 선택했는가?"** 원칙 질문 추가
- Step 6 (Review): summary.md를 source-map 참조가 아닌 **실질적 프로젝트 맥락**으로 작성하도록 가이드
- [autonomous] CLAUDE.md 생성 step 추가 (genome/environment 참조)

### 3. adoption.ts — Conversation prompt 개선
- Step 2 (Review Genome): auto-generated 내용 확인 후 **"이 프로젝트에서 가장 중요한 설계 원칙은?"** 추가
- Step 4 (What Scan Cannot Detect): **"왜 이 아키텍처를 선택했는가?"**, **"이 프로젝트만의 독특한 패턴이 있는가?"** 추가
- environment/summary.md: source-map 참조만 하지 않고 **핵심 맥락을 직접 작성**하도록 가이드
- [autonomous] CLAUDE.md 생성 step 추가

### 4. adoption.ts — environment/summary.md 생성 개선
현재: tech stack 3줄 + "See source-map.md"
개선: scanner 결과를 활용하여 Source Structure 요약, Build & Scripts, Design Decisions placeholder 포함

### 5. genome-suggest.ts — application.md 초안 개선
- Architecture Decisions에 "왜" 섹션 placeholder 추가
- Conventions 섹션에 scanner가 감지한 것 + "확인/보완 필요" 마킹

## Requirements

### Functional Requirements
1. init 후 evolution.md가 REAP 기반 프로젝트의 진화 원칙을 포함
2. greenfield conversation이 원칙(principle) 질문을 포함
3. adoption conversation이 원칙 질문 + scanner 한계 보완 질문 포함
4. environment/summary.md가 자체적으로 유용한 내용을 포함
5. CLAUDE.md가 init에서 자동 생성

### Completion Criteria
1. common.ts의 DEFAULT_EVOLUTION이 현재 evolution.md 내용 수준
2. greenfield/adoption conversation prompt에 원칙 질문 존재
3. adoption의 envSummary가 source-map 참조 외 실질 정보 포함
4. CLAUDE.md 생성 로직 존재
5. typecheck + build 통과
6. e2e-init.sh 통과

## Implementation Plan

- [ ] T001: common.ts — DEFAULT_EVOLUTION을 현재 evolution.md 수준으로 교체
- [ ] T002: greenfield.ts — conversation prompt에 원칙 질문 추가 + CLAUDE.md step
- [ ] T003: adoption.ts — conversation prompt 개선 + CLAUDE.md step
- [ ] T004: adoption.ts — envSummary 생성 로직 개선
- [ ] T005: genome-suggest.ts — application.md 초안에 "왜" placeholder 추가
- [ ] T006: init common 또는 greenfield/adoption — CLAUDE.md 파일 생성 로직
- [ ] T007: typecheck + build + e2e-init.sh 검증
