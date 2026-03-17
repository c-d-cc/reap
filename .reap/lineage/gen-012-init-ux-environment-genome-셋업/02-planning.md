# Planning

## Summary
CLI init 명령어의 UX 개선(name optional + 기존 프로젝트 감지)과, AI 에이전트 프롬프트(reap.objective.md)에 Environment/Genome 대화형 셋업 지시를 추가한다.

## Technical Context
- Runtime: Bun, TypeScript
- CLI: commander.js
- Slash commands: 마크다운 프롬프트 파일

## Tasks

### Phase 1: CLI init UX 개선
- [ ] T001 `src/cli/index.ts` — init command의 `<project-name>` 인자를 optional(`[project-name]`)로 변경
- [ ] T002 `src/cli/index.ts` — name 없이 실행 시 `path.basename(process.cwd())`를 프로젝트 이름으로 사용
- [ ] T003 `src/cli/index.ts` — name 없이 실행 시 프로젝트 루트 시그널(package.json, go.mod, .git 등) 감지하여 adoption 모드 제안 출력
- [ ] T004 `src/cli/commands/init.ts` — 변경 없음 (기존 함수 시그니처 유지, 호출부에서 처리)
- [ ] T005 `tests/commands/init.test.ts` — name 없는 init, 기존 프로젝트 감지 테스트 추가

### Phase 2: reap.objective.md 프롬프트 개선
- [ ] T006 `src/templates/commands/reap.objective.md` — Step 1 (Environment Scan) 수정: 비어있을 때 Environment 개념 브리핑 텍스트 + 대화형 수집 질문 지시 추가
- [ ] T007 `src/templates/commands/reap.objective.md` — Step 4 (Genome Health Check) 수정: 첫 Generation + greenfield일 때 앱 소개 질문 → 스택 추천 → 설계 질문 순서 지시
- [ ] T008 `src/templates/commands/reap.objective.md` — Step 4 (Genome Health Check) 수정: 첫 Generation + adoption일 때 root 검증 → 문서 수집/검증 → 소스 분석 → genome 추론 순서 지시

### Phase 3: 정리
- [ ] T009 테스트 실행 (`bun test`) 및 수정
- [ ] T010 backlog 항목 3개(01, 02, 03) 정리 — 완료 처리

## Dependencies
- Phase 1 → Phase 3 (테스트)
- Phase 2는 독립적 (프롬프트 파일 수정)
- T006, T007, T008은 [P] 병렬 가능하나 같은 파일이므로 순차 권장
