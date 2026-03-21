## What's New

- **Script Orchestrator Architecture**: 28개 slash command를 1줄 `.md` wrapper + TypeScript script(`src/cli/commands/run/`)로 전환. 모든 deterministic 로직이 script에서 실행되고 AI에게는 structured JSON으로 지시.
- **autoSubagent Mode**: `/reap.evolve` 실행 시 자동으로 subagent에게 generation lifecycle 위임. config.yml `autoSubagent: true` (기본값).
- **Completion Auto-Archive**: `reap run completion --phase genome`이 consume → archive → commit까지 자동 실행. 4 phase → 2 phase로 간소화.
- **Frontmatter Hard-Gate**: `current.yml`과 artifact 파일에 `REAP MANAGED` 주석 추가. AI의 직접 수정 금지 규칙 강화.
- **Version Display**: `reap status`와 `/reap.help`에 REAP 버전 + latest 여부 출력.
- **Hook Engine**: 파일 기반 hook 시스템 (`executeHooks`) + condition 평가 + `.sh`/`.md` 실행.
- **Commit Module**: submodule 상태 확인 + git commit 유틸.
- **Legacy Cleanup**: `reap update` 시 `~/.claude/commands/reap.*.md` 레거시 자동 삭제.

## Bug Fixes

- `reap init`: 기존 프로젝트 감지 시 자동 adoption 모드 전환
- `backlog.ts`: title 추출 heading → frontmatter title → filename fallback
- `abort`: consumed backlog를 pending으로 복원 (`revertBacklogConsumed`)
- `backlog carry forward`: pending 항목이 completion 후에도 유지

## Tests

- 286 → 539 tests (+253)
- Command script 직접 테스트 (26개 command)
- E2E scenario tests (normal lifecycle + merge lifecycle)
- Invenio 실전 검증 (3 generations + abort + back)

## Generations

- **gen-087-adc61f**: Script Orchestrator Architecture — reap run CLI primitives
- **gen-088-86dd81**: Hook 실행 엔진 + commit 로직 통합
- **gen-089-c9ee0c**: E2E hook-engine + commit 통합 검증
- **gen-090-78a997**: Normal lifecycle command 7개 전환
- **gen-091-3fe671**: Utility command 7개 전환
- **gen-092-17baef**: Merge command 10개 전환
- **gen-093-76b22f**: Script Orchestrator 테스트 커버리지 (286→472)
- **gen-094-2dc229**: E2E scenario tests (472→518)
- **gen-095-29a710**: Invenio 실전 검증
- **gen-096-57c421**: Backlog 버그 3건 수정
- **gen-097-724974**: Genome/Environment sync
- **gen-098-7d39ee**: autoSubagent 모드
- **gen-099-3e6442**: frontmatter hard-gate + version 출력 + completion auto-archive
