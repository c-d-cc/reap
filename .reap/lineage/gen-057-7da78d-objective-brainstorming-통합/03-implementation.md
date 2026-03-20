# Implementation

## Progress

| Task | Status | Notes |
|------|--------|-------|
| T001 server.cjs | ✅ | Node.js 내장 HTTP+WebSocket 서버, fs.watch, 30분 타임아웃. `.js`→`.cjs` 변경 (package.json type:module) |
| T002 frame.html | ✅ | 다크 테마, .options/.cards/.mockup/.split/.pros-cons CSS 클래스 |
| T003 start-server.sh | ✅ | 백그라운드/포그라운드 모드, PID 관리, .server-info |
| T004 reap.objective.md | ✅ | Step 5를 5a~5e로 확장 + Step 8 Spec Review Loop 추가 |
| T005 visual-companion-guide.md | ✅ | 브라우저/터미널 판단 규칙, 턴 기반 흐름, CSS 클래스 레퍼런스 |
| T006 spec-reviewer-prompt.md | ✅ | 완전성/일관성/명확성/스코프/YAGNI/검증가능성 기준 |
| T007 01-objective.md 템플릿 | ✅ | Design 섹션 추가 (Approaches, Selected Design, Approval History) |
| T008 build.js | ✅ | start-server.sh chmod +x 추가 |
| T009 init.ts + update.ts | ✅ | brainstorm 파일 설치/동기화 로직 추가 |
| T010 서버 테스트 | ✅ | 기동 성공, HTTP 응답 확인 |
| T011 bun test | ✅ | 159 pass, 0 fail |
| T012 tsc --noEmit | ✅ | 통과 |
| T013 npm run build | ✅ | 성공 |

## Changes
- `src/templates/brainstorm/server.cjs` — 신규 (비주얼 컴패니언 HTTP+WebSocket 서버)
- `src/templates/brainstorm/frame.html` — 신규 (프레임 템플릿)
- `src/templates/brainstorm/start-server.sh` — 신규 (서버 기동 스크립트)
- `src/templates/brainstorm/visual-companion-guide.md` — 신규 (사용 가이드)
- `src/templates/brainstorm/spec-reviewer-prompt.md` — 신규 (Spec 리뷰 프롬프트)
- `src/templates/commands/reap.objective.md` — 수정 (brainstorming 9단계 통합)
- `src/templates/artifacts/01-objective.md` — 수정 (Design 섹션 추가)
- `scripts/build.js` — 수정 (chmod +x 추가)
- `src/cli/commands/init.ts` — 수정 (brainstorm 파일 설치)
- `src/cli/commands/update.ts` — 수정 (brainstorm 파일 동기화)

## Implementation Notes
- `server.js` → `server.cjs` 변경: package.json의 `"type": "module"` 설정 때문에 `.js`가 ESM으로 해석됨. CommonJS(`require`)를 사용하는 서버는 `.cjs` 확장자 필요
- build.js에 별도 brainstorm 복사 로직 불필요 — 기존 `cp -r src/templates dist/templates`가 brainstorm/ 포함하여 전체 복사
- update.ts에 brainstorm 동기화 추가하여 `reap update` 시에도 최신 서버 코드 반영

## Issues
없음
