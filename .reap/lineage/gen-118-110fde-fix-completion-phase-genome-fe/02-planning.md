# Planning

## Summary
completion phase `"genome"` → `"feedKnowledge"` 리네이밍 + feedKnowledge phase에서 genome/env 영향 자동 감지 로직 추가.

## Technical Context
- **Tech Stack**: TypeScript, Node.js, Commander.js
- **Constraints**: 파일 I/O는 src/core/fs.ts 경유, git diff는 execSync 사용

## Tasks

### Phase 1: 리네이밍
- [x] T001 `src/cli/commands/run/completion.ts` -- phase `"genome"` → `"feedKnowledge"` 변경 (조건문, prompt, nextCommand)
- [x] T002 `src/cli/commands/run/evolve.ts:85` -- "genome phase" 참조를 "feedKnowledge phase"로 변경
- [x] T003 `src/templates/hooks/reap-guide.md:173` -- "genome phase" 참조를 "feedKnowledge phase"로 변경

### Phase 2: 자동 감지 로직
- [x] T004 `src/cli/commands/run/completion.ts` -- feedKnowledge phase에 detectGenomeImpact() 함수 추가
  - git diff --name-only로 변경 파일 수집
  - 패턴 매칭: commands/ → Slash Commands, package.json → Tech Stack, core/ → principles/source-map
  - 감지 결과를 prompt에 포함

### Phase 3: 테스트 업데이트
- [x] T005 `tests/commands/run/completion.test.ts` -- phase `"genome"` → `"feedKnowledge"` 테스트 업데이트
- [x] T006 `tests/e2e/run-lifecycle.test.ts` -- genome phase 참조 확인 및 업데이트

## Dependencies
- T001 선행 → T002, T003 (리네이밍 기반)
- T004는 T001과 병행 가능
- T005, T006은 T001, T004 완료 후

