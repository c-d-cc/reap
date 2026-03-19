# Planning

## Summary

3개 작업을 3 Phase로 진행:
1. Compression 임계값 조정 (5,000줄) + 최근 3개 generation 보호
2. Hooks condition/execute 구조 리팩토링 — config에서 prompt 분리, condition 기반 실행
3. genome/source-map.md 추가 — C4 Container 수준 Mermaid 다이어그램

## Technical Context
- **Tech Stack**: TypeScript (compression.ts, types), YAML (config.yml), Markdown (hooks, genome)
- **Constraints**: hooks는 AI 에이전트가 실행 (slash command template의 지시를 따름). condition 평가도 AI가 수행.

## Design Decisions

### Hooks 새 구조
```yaml
hooks:
  onGenerationComplete:
    - condition: "has-code-changes"
      execute: ".reap/hooks/version-bump.md"    # .md = prompt
    - condition: "always"
      command: "~/.bun/bin/bun run src/cli/index.ts -- update"  # inline command
    - condition: "has-code-changes"
      execute: ".reap/hooks/docs-update.md"
    - condition: "version-bumped"
      execute: ".reap/hooks/release-notes.md"
```

- `execute`: 파일 경로 (.md = AI prompt, .sh = shell script)
- `command`: 인라인 쉘 명령 (간단한 것용, 유지)
- `condition`: AI가 평가하는 조건 (always, has-code-changes, version-bumped)
- `prompt` 필드: deprecated → `execute`로 대체

### Supported Conditions
- `always` — 항상 실행
- `has-code-changes` — src/ 파일이 이번 generation에서 변경됨
- `version-bumped` — package.json version ≠ 마지막 git tag

## Tasks

### Phase 1: Compression
- [ ] T001 `src/core/compression.ts` — `LINEAGE_MAX_LINES` 10,000 → 5,000
- [ ] T002 `src/core/compression.ts` — 최근 3개 generation 보호 로직 추가 (RECENT_PROTECTED_COUNT = 3)

### Phase 2: Hooks 리팩토링
- [ ] T003 `src/types/index.ts` — `ReapHookCommand`에 `execute?: string`, `condition?: string` 필드 추가
- [ ] T004 `.reap/hooks/` — version-bump.md, docs-update.md, release-notes.md 파일 생성 (기존 config.yml에서 분리)
- [ ] T005 `.reap/config.yml` — 새 condition/execute 구조로 변경
- [ ] T006 `src/templates/hooks/reap-guide.md` — 새 hook 구조 문서화
- [ ] T007 `src/templates/commands/reap.next.md` — hook 실행 지시를 condition 평가 포함으로 업데이트
- [ ] T008 [P] `src/templates/commands/reap.start.md`, `reap.back.md` — 동일하게 condition 지시 업데이트

### Phase 3: Source-map
- [ ] T009 `.reap/genome/source-map.md` — C4 Context + Container Mermaid 다이어그램 작성 (~150줄 한도)

### Phase 4: 빌드 + 동기화 + 검증
- [ ] T010 `npm run build && reap update` — 빌드 + 템플릿 동기화
- [ ] T011 `bun test` — 전체 테스트 통과
- [ ] T012 `bunx tsc --noEmit` — TypeScript 컴파일 확인

## Dependencies

T001, T002 → 독립
T003 → T004, T005, T006, T007, T008 (타입 먼저)
T004, T005 → T006, T007, T008과 병렬 가능
T009 → 독립
T010 → T001~T009 완료 후
T011, T012 → T010 후 (병렬)
