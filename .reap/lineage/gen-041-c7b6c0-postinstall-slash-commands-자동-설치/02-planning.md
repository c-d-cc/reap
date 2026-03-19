# Planning

## Summary
`npm install -g` 시 `postinstall` 스크립트로 감지된 모든 에이전트(Claude Code, OpenCode)에 slash commands 자동 설치.
빌드된 `dist/` 환경에서 실행되므로 TypeScript 코어 로직 직접 호출 불가 — 순수 Node.js 스크립트(`scripts/postinstall.js`)를 신규 작성.
`dist/templates/commands/*.md` → 에이전트별 commands 디렉토리로 복사. 실패 시 graceful exit(0).

## Technical Context
- **Tech Stack**: Node.js >=18, fs/promises
- **Constraints**: dist/ 환경에서 실행, 추가 의존성 없음, Bun API 금지
- **Key Path**: `dist/templates/commands/` (빌드 시 `src/templates/` → `dist/templates/`로 복사됨)
- **Targets** (에이전트 감지 기반):
  - Claude Code: `~/.claude/commands/`
  - OpenCode: `~/.config/opencode/commands/`
- **에이전트 감지**: `~/.claude/` 또는 `~/.config/opencode/` 디렉토리 존재 여부로 판단

## Tasks

### Phase 1: postinstall 스크립트
- [ ] T001 `scripts/postinstall.js` 신규 생성 — 에이전트 감지 + dist/templates/commands/*.md → 에이전트별 commands dir 복사
- [ ] T002 `package.json` — `"postinstall": "node scripts/postinstall.js"` 추가

### Phase 2: 검증
- [ ] T003 `bun test` + `bunx tsc --noEmit` 통과 확인
- [ ] T004 `npm run build && node scripts/postinstall.js` 수동 실행 검증

## Dependencies
T001 → T002 → T003, T004 (순차)
