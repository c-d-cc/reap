# Generation Goal

## 목표
REAP CLI/슬래쉬 커맨드 완성도 향상 — 누적된 backlog 4건을 모두 해소하여 CLI와 슬래쉬 커맨드의 일관성을 확보하고, init 경험과 워크플로우 규칙을 개선한다.

## 완료 조건
- [ ] `/reap.evolve` 슬래쉬 커맨드 추가 (템플릿 + init 복사 + 기존 7개 커맨드 "완료" 섹션 업데이트)
- [ ] `reap update` 명령 구현 (commands/templates/domain 가이드 동기화, `--dry-run` 옵션)
- [ ] git 커밋 타이밍 규칙 정의 (Growth Gate에 git 상태 확인, conventions.md에 타이밍 규칙)
- [ ] init preset bootstrap 구현 (`--preset` 옵션, 최소 1개 프리셋 포함)
- [ ] 전체 테스트 통과 (`bun test`)
- [ ] TypeScript 컴파일 통과 (`bunx tsc --noEmit`)

## 범위
- **관련 Genome 영역**: conventions.md (git 커밋 타이밍 규칙 — Birth에서 반영)
- **예상 변경 범위**:
  - `src/templates/commands/reap.evolve.md` 신규
  - `src/templates/commands/reap.*.md` 7개 파일 "완료" 섹션 수정
  - `src/cli/commands/update.ts` 신규
  - `src/cli/commands/init.ts` preset 로직 추가
  - `src/templates/presets/` 디렉토리 신규
  - `src/cli/index.ts` update 서브커맨드 등록
  - `.claude/commands/`, `.reap/commands/` 동기화
- **제외 사항**: genome 본문 변경은 Birth에서만 수행

## 배경
- Backlog 01: init preset bootstrap — Gen-002부터 누적, 초기 설정 편의성 개선
- Backlog 02: reap update — Gen-004 adaptation에서 발견, 프로젝트 간 템플릿 동기화 문제
- Backlog 03: git 커밋 타이밍 — Gen-001(selfview) Growth 진입 시 uncommitted 변경 대량 발견
- Backlog 04: /reap.evolve — 라이프사이클 슬래쉬 커맨드 점검 중 CLI-only 문제 발견
