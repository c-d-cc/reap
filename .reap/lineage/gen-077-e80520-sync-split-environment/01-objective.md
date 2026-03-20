# Objective

## Goal
1. reap.sync를 sync(orchestrator) / sync.genome / sync.environment로 분리
2. Environment 3-layer 구조 도입 (summary.md + docs/ + resources/)
3. session-start에서 environment summary.md를 context에 로딩
4. reap init에서 environment 3-layer 디렉토리 생성

## Completion Criteria
- 커맨드 3개 생성 (sync, sync.genome, sync.environment)
- init.ts COMMAND_NAMES 업데이트
- session-start/genome-loader에서 summary.md 로딩
- init에서 environment/docs/, environment/resources/ 디렉토리 생성
- reap.objective Step 1 sync.environment 연동 간소화
- 빌드/테스트 통과
