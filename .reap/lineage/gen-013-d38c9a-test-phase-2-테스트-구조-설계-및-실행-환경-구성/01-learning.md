# Learning — gen-013-d38c9a

## Goal
Test Phase 2: 테스트 구조 설계 및 실행 환경 구성

## 현재 상태 분석

### tests/ submodule 현황 (self-evolve branch)
- v0.15 구조 파일이 그대로 존재: `commands/`, `core/`, `integration/`, `e2e/`
- v0.16용 빈 디렉토리: `unit/`, `scenario/`
- README.md는 이미 v0.16 구조를 반영 (unit, e2e, scenario)

### v0.15 잔여 파일 (정리 대상)
- `tests/commands/` — v0.15 커맨드 테스트 (6파일 + run/ 하위 28파일)
- `tests/core/` — v0.15 코어 테스트 (20파일 + agents/ 4파일)
- `tests/integration/` — v0.15 통합 테스트 (1파일)
- `tests/e2e/` — v0.15 e2e 테스트 (scenarios/ 7파일 + 기타 12파일)

### 유지할 구조
- `tests/unit/` (비어있음 — 새로 구성)
- `tests/e2e/` (기존 내용 정리 후 재구성)
- `tests/scenario/` (비어있음 — 새로 구성)
- `tests/README.md` (이미 v0.16 반영)

### 프로젝트 빌드/테스트 환경
- **Runtime**: bun (빌드에 이미 사용)
- **빌드**: `bun build src/cli/index.ts --outdir dist/cli --target node`
- **TypeScript**: strict mode, ES2022, bundler moduleResolution
- **tsconfig.json**: rootDir=src, tests/ 미포함 (include: src/**/*.ts)
- **package.json scripts**: 현재 test 관련 script 없음

### 기존 e2e 스크립트 (scripts/)
- `scripts/e2e-init.sh` — init 커맨드 검증 (greenfield/adoption)
- `scripts/e2e-lifecycle.sh` — lifecycle 흐름 검증
- `scripts/e2e-merge.sh` — merge 기능 검증
- `scripts/e2e-multi-generation.sh` — 다세대 검증
- 패턴: mktemp → CLI 실행 → grep/check → cleanup, PASS/FAIL 카운터

### 주요 고려사항
1. **bun:test import 경로**: tsconfig에 tests/ 미포함 → bun test는 자체 TS 해석으로 동작하므로 별도 tsconfig 불필요할 수 있으나, `src/core` import 시 상대경로 또는 path mapping 필요
2. **submodule 분리**: tests/ 내부 변경은 reap-test repo에 별도 commit/push
3. **e2e 패턴**: 기존 scripts/e2e-*.sh 패턴을 재사용 (shell 기반, dist/cli/index.js 사용)
4. **scenario vs e2e**: scenario는 sandbox에서 full lifecycle 시뮬레이션, e2e는 개별 커맨드 검증

## 학습 요약
- v0.15 파일 대량 정리 필요 (commands/, core/, integration/ 삭제, e2e/ 내부 재구성)
- unit test: bun:test 기반, src/core 함수를 relative path로 import
- e2e: shell script 기반, 기존 scripts/e2e-*.sh 패턴 활용
- scenario: temp dir + reap init + lifecycle 실행 + 검증 + cleanup
- package.json에 test:unit, test:e2e, test:scenario, test scripts 추가 필요
