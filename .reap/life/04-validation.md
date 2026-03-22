# REAP MANAGED — Do not modify directly. Use reap run commands.
# Validation Report

## Result: pass

## Completion Criteria Check
| Criterion | Result | Notes |
|-----------|--------|-------|
| CC-1: active generation → 에러 | pass | GenerationManager.current() null check 구현 |
| CC-2: no pending → 메시지 | pass | 빈 backlog 시 "No pending genome changes" emitOutput |
| CC-3: pending → JSON prompt | pass | emitOutput status:"prompt" + context.items |
| CC-4: --apply → consumed 마킹 | pass | markBacklogConsumed(consumedBy:"update-genome") |
| CC-5: --apply → genomeVersion 증가 | pass | ConfigManager.read/write + config.genomeVersion bump |
| CC-6: --apply → commit 지시 JSON | pass | emitOutput prompt에 commit 메시지 포함 |
| CC-7: genome-integrity-checker.md completion 적용 | deferred | completion 단계에서 적용 예정 |

## Test Results

| 검증 항목 | 명령어 | 결과 | Exit Code |
|-----------|--------|------|-----------|
| 단위/통합 테스트 | `bun test` | 600 pass, 0 fail | 0 |
| TypeScript 컴파일 | `bunx tsc --noEmit` | clean | 0 |
| Node.js 빌드 | `npm run build` | 147 modules bundled, 0.59 MB | 0 |
| 구조 검사 | `reap fix --check` | 기존 이슈 (gen-057 meta.yml 누락, source-map 127줄) — 본 변경과 무관 | 1 (pre-existing) |

## Deferred Items

- CC-7: genome-integrity-checker.md backlog 적용은 completion 단계에서 수행

## Minor Fixes (Fixed Directly in This Stage)
| File | Change | Reason |
|------|--------|--------|

## Issues Discovered

- 기존 `reap fix --check` 이슈 (gen-057 meta.yml 누락, source-map.md 127줄) — 본 generation과 무관
