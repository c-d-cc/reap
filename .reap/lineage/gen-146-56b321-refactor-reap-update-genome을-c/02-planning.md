# Planning

## Summary
`update-genome`을 CLI subcommand에서 run command (slash command)로 변환. 7개 파일 수정, 1개 신규, docs 4개 수정.

## Technical Context
- **Tech Stack**: TypeScript, Commander.js, esbuild
- **Constraints**: run command `execute(paths, phase, argv)` 시그니처 준수, emitOutput/emitError 패턴 유지

## Tasks

### T1: Run command 파일 생성
- `src/cli/commands/update-genome.ts`의 로직을 `src/cli/commands/run/update-genome.ts`로 이동
- `execute(paths, phase, argv)` 시그니처 적용
- phase 없음/"scan" → scan, phase "apply" → apply
- ReapPaths 인스턴스를 외부에서 받으므로 직접 생성 불필요
- isReapProject 체크는 run/index.ts dispatcher가 이미 수행

### T2: CLI subcommand 제거
- `src/cli/index.ts`에서 `import { updateGenome }` 제거
- `program.command("update-genome")` 블록 제거

### T3: Dispatcher 등록
- `src/cli/commands/run/index.ts`에 `"update-genome": () => import("./update-genome")` 추가

### T4: Slash command 템플릿 생성
- `src/templates/commands/reap.update-genome.md` — 1-line wrapper 패턴

### T5: COMMAND_NAMES 등록
- `src/cli/commands/init.ts`에 `"reap.update-genome"` 추가

### T6: Genome 업데이트
- `constraints.md`: CLI Subcommands 9→8 (update-genome 제거), Slash Commands Normal 18→19 (+reap.update-genome)
- `source-map.md`: CLI Commands 테이블에서 update-genome 제거, run scripts 카운트 27→28

### T7: Docs 업데이트
- `docs/src/pages/CLIPage.tsx`: update-genome 섹션 제거
- `docs/src/i18n/translations/{en,ko,ja,zh-CN}.ts`: updateGenome 항목을 cli에서 commands 섹션으로 이동 또는 제거

### T8: 기존 파일 삭제
- `src/cli/commands/update-genome.ts` 삭제

## Dependencies
T1 → T2, T3 (순서 중요하지 않으나 T1 먼저)
T4, T5 독립
T6, T7 독립
T8은 T1 이후
