# REAP Project

이 프로젝트는 REAP(Recursive Evolutionary Autonomous Pipeline)를 사용합니다.
모든 작업은 genome 원칙에 따라 수행해야 합니다.

## Genome (필수 숙지)

세션 시작 시 아래 파일들을 반드시 읽고 원칙을 따르세요:

- `.reap/genome/application.md` — 프로젝트 아키텍처, 컨벤션, 기술 스택
- `.reap/genome/evolution.md` — AI 행동 가이드, 소통 원칙
- `.reap/genome/invariants.md` — 절대 제약 (위반 불가)

## Environment (필수 숙지)

프로젝트의 기술적 맥락입니다. 세션 시작 시 반드시 읽으세요:

- `.reap/environment/summary.md` — 소스 구조, 빌드, 테스트, 설계 결정 (항상 로딩)
- `.reap/environment/domain/` — 도메인 지식 (필요 시 로딩)

## Quick Start

1. `reap status` — 현재 상태 확인
2. `/reap.start` — 새 generation 시작
3. `/reap.evolve` — 전체 lifecycle 실행
4. `/reap.help` — 사용 가능한 명령어 확인
