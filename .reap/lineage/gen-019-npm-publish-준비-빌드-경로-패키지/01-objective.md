# Objective

## Goal
npm publish 준비 — 빌드 파이프라인 + 경로 해석 + package.json 정비

## Completion Criteria
1. `npm run build`로 dist/cli.js + dist/templates/ 생성
2. `packageTemplatesDir`가 dev(src/core/)와 dist(dist/) 양쪽에서 정상 해석
3. `npm publish --dry-run`이 dist/ 만 포함 (tests, .reap, docs 제외)
4. `npx @c-d-cc/reap` 또는 `reap` 명령어가 dist/cli.js를 실행
5. `bun test`, `bunx tsc --noEmit`, 빌드 통과

## Requirements

### Functional Requirements
- FR-001: build 스크립트 — bun build + cp -r src/templates dist/templates
- FR-002: paths.ts — packageTemplatesDir dev/dist 양쪽 호환
- FR-003: package.json — bin, files, scripts, engines 정비
- FR-004: npm publish --dry-run 검증

### Non-Functional Requirements
- engines: node >= 18

## Scope
- **Related Genome Areas**: constraints.md (빌드 명령)
- **Expected Change Scope**: package.json, src/core/paths.ts, build script
- **Exclusions**: 실제 npm publish는 하지 않음 (dry-run만)
