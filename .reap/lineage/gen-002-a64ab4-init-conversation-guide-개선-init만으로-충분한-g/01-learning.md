# Learning — gen-002-a64ab4

## Goal
init conversation guide 개선 — init만으로 충분한 genome/environment 생성

## Previous Generation Reference
gen-001에서 3개 에이전트로 코드베이스를 탐구하고 genome/environment/vision을 수동으로 채움.
Fitness 피드백: genome/environment 경계 모호, 새 세션에서 genome 미로딩 문제, init이 더 좋은 질문을 해야 함.

## Key Findings — Init 코드 분석

### 현재 init 구조
1. **scanner.ts**: package.json, 디렉토리 2레벨, README 500자, 의존성/스크립트 추출
2. **genome-suggest.ts**: scan 결과로 application.md 초안 생성 (identity, architecture, tech stack, conventions, constraints)
3. **greenfield.ts**: 빈 템플릿 + conversation prompt (7 steps)
4. **adoption.ts**: scan → genome suggest + source-map → conversation prompt (7 steps)

### Gap 분석: init 결과 vs 수동 작성 genome/environment

| 영역 | init이 생성하는 것 | 수동으로 채운 것 | Gap |
|------|-------------------|----------------|-----|
| **application.md** | 이름, README 1줄, 디렉토리 패턴 추론, 프레임워크 감지, lint/prettier 유무 | Identity(목적, 대상), Architecture(메타포, layer 구조, lifecycle), Nonce system, State management, Maturity, Conventions(상세), Genome rules | **설계 철학, 핵심 메타포, 비기능 원칙이 전혀 없음** |
| **evolution.md** | 기본 3줄 (common.ts에서 생성) | Clarity-driven interaction, Genome 관리 원칙, Self-exploration, Echo chamber 방지, 환경 갱신 전략 | **common.ts의 DEFAULT_EVOLUTION이 너무 빈약. 현재 evolution.md 수준의 내용이 기본값이어야 함. conversation에서 다룰 영역이 아님 — generation을 거치며 진화하는 것.** |
| **environment/summary.md** | Tech stack 3줄 + "See source-map.md" | 전체 src/ 트리 + 각 모듈 역할 설명 + Build & Scripts + Tests + Key Design Decisions | **summary가 source-map 참조만 하고 자체 정보 부족** |
| **environment/source-map.md** | 디렉토리 트리 + 의존성 목록 + 스크립트 목록 | (미작성) | source-map은 괜찮으나 모듈별 역할 설명이 없음 |
| **invariants.md** | 기본 3개 (pipeline 규칙) | 기본 3개 유지 | OK — conversation에서 프로젝트별 추가 유도 |
| **vision/goals.md** | 빈 템플릿 (common.ts) | 30항목 체크리스트 | conversation Step 7에서 다루나, 템플릿이 너무 빈약 |

### 근본 원인

1. **scanner가 코드만 본다**: 파일 구조와 의존성은 잘 추출하지만, "이 프로젝트가 왜 이런 구조인지", "어떤 원칙으로 만들었는지"는 코드에서 추론 불가. 이건 인간에게 물어야 함.

2. **conversation prompt가 사실(fact) 중심**: "What tech stack?", "What conventions?" — 이미 아는 것을 확인하는 질문. "왜 이 구조를 선택했는가?", "이 프로젝트의 핵심 메타포는?", "AI가 이 프로젝트에서 절대 하면 안 되는 것은?" 같은 원칙(principle) 질문이 없음.

3. **DEFAULT_EVOLUTION이 빈약**: common.ts에서 3줄짜리 기본값만 제공. evolution은 REAP의 운영 원칙이므로 사용자에게 물어볼 영역이 아니라, REAP가 best practice로 미리 채워야 함. generation을 거치며 자연스럽게 진화.

4. **environment/summary.md가 source-map 참조만 함**: summary는 "항상 로딩되는" 핵심 문서인데, adoption에서는 내용이 거의 없음.

5. **CLAUDE.md 생성이 없음**: init에서 CLAUDE.md를 만들지 않으므로 새 세션에서 genome이 자동 로딩되지 않음.

## Context

- **Generation type**: embryo
- **Maturity**: bootstrap
- **Clarity Level**: High — goal이 명확하고, gap 분석이 구체적이며, 변경 대상 파일이 특정됨.

## Backlog 관련
- `init-auto-detect-mode.md`: 이미 구현됨 (detectMode 함수 존재). 이 세대에서 정리 가능.
- `genome-environment-boundary.md`: 이 세대의 scope과 관련 있으나, conversation guide 개선이 우선. boundary 정리는 별도 세대.
