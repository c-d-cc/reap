# REAP Project

이 프로젝트는 REAP(Recursive Evolutionary Autonomous Pipeline)를 사용합니다.
모든 작업은 genome 원칙에 따라 수행해야 합니다.

## REAP Guide (필수 숙지)

- `.reap/reap-guide.md` — REAP 도구 사용법, 아키텍처, lifecycle, 규칙

## Genome (필수 숙지)

세션 시작 시 아래 파일들을 반드시 읽고 원칙을 따르세요:

- `.reap/genome/application.md` — 프로젝트 아키텍처, 컨벤션, 기술 스택
- `.reap/genome/evolution.md` — AI 행동 가이드, 소통 원칙
- `.reap/genome/invariants.md` — 절대 제약 (위반 불가)

## Environment (필수 숙지)

프로젝트의 기술적 맥락입니다. 세션 시작 시 반드시 읽으세요:

- `.reap/environment/summary.md` — 소스 구조, 빌드, 테스트, 설계 결정 (항상 로딩)
- `.reap/environment/domain/` — 도메인 지식 (필요 시 로딩)

## Agent

Generation을 subagent에 위임할 때 `subagent_type: "reap-evolve"`를 사용하세요. 이 agent에는 REAP generation 실행에 필요한 role, mindset, 행동 규칙이 정의되어 있습니다. 동적 context(generation state, vision, memory)는 prompt 파라미터로 전달하세요.
