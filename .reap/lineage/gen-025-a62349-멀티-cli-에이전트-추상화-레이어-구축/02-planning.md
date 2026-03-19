# Planning

## Summary
CLI 에이전트(Claude Code, OpenCode 등)를 `AgentAdapter` 인터페이스로 추상화하고, `AgentRegistry`로 자동 감지/관리한다. 기존 Claude Code 하드코딩(`paths.ts`, `hooks.ts`, `init.ts`, `update.ts`)을 어댑터 패턴으로 리팩토링하고, OpenCode 어댑터를 추가한다.

### 아키텍처 결정
- `src/core/agents/` 디렉토리에 어댑터 모듈 배치
- `AgentAdapter` 인터페이스: 커맨드 설치, 훅 등록, 설정 읽기 추상화
- `AgentRegistry`: 전체 어댑터 목록 + 설치 감지 + config 오버라이드
- OpenCode 훅: `~/.config/opencode/plugins/`에 JS 플러그인으로 설치
- 기존 `hooks.ts`는 Claude Code 전용 로직을 `ClaudeCodeAdapter`로 이관, 공용 함수만 유지

## Technical Context
- **Tech Stack**: TypeScript, Node.js 호환, Commander.js
- **Constraints**: fs/promises 사용, 외부 서비스 없음, `src/core/fs.ts` 유틸 경유

## Tasks

### Phase 1: 타입 + 인터페이스 정의
- [ ] T001 `src/types/index.ts` — `AgentAdapter` 인터페이스, `AgentName` 타입, `ReapConfig.agents` 필드 추가
- [ ] T002 [P] `src/core/agents/index.ts` — `AgentRegistry` 클래스 (감지, 목록, config 오버라이드)

### Phase 2: 어댑터 구현
- [ ] T003 `src/core/agents/claude-code.ts` — `ClaudeCodeAdapter` (기존 hooks.ts + paths.ts 로직 이관)
- [ ] T004 [P] `src/core/agents/opencode.ts` — `OpenCodeAdapter` (~/.config/opencode/ 경로, 커맨드 설치, 플러그인 훅 등록)

### Phase 3: OpenCode 템플릿
- [ ] T005 `src/templates/hooks/opencode-session-start.js` — OpenCode 플러그인 (session.start 훅, REAP context 주입)

### Phase 4: 기존 코드 리팩토링
- [ ] T006 `src/core/hooks.ts` — `registerClaudeHook`/`syncHookRegistration`을 어댑터 위임으로 변경, 공용 migration 로직 유지
- [ ] T007 `src/core/paths.ts` — `userClaudeDir`/`userClaudeCommands`/`userClaudeSettingsJson`을 deprecated 마킹, 어댑터에서 관리
- [ ] T008 `src/cli/commands/init.ts` — `AgentRegistry.detectInstalled()`로 감지, 각 어댑터에 설치 위임
- [ ] T009 `src/cli/commands/update.ts` — 동일하게 멀티 에이전트 동기화
- [ ] T010 `src/cli/index.ts` — help 커맨드 language 감지를 어댑터 순회로 변경

### Phase 5: 빌드 + 버전
- [ ] T011 `scripts/build.js` — OpenCode 플러그인 파일이 dist/templates/에 포함되는지 확인
- [ ] T012 `package.json` — 버전 0.2.0으로 범프

### Phase 6: 테스트
- [ ] T013 `tests/core/agents/registry.test.ts` — AgentRegistry 감지/목록 테스트
- [ ] T014 [P] `tests/core/agents/claude-code.test.ts` — ClaudeCodeAdapter 테스트
- [ ] T015 [P] `tests/core/agents/opencode.test.ts` — OpenCodeAdapter 테스트
- [ ] T016 기존 테스트 — 리팩토링 후 기존 테스트 통과 확인

## Dependencies
```
T001 → T002, T003, T004 (인터페이스 먼저)
T003, T004 → T006, T007, T008, T009, T010 (어댑터 완성 후 리팩토링)
T005 → T004 (OpenCode 플러그인 → 어댑터에서 참조)
T008, T009 → T011, T012 (리팩토링 완료 후 빌드/버전)
T003, T004 → T013, T014, T015 (어댑터 완성 후 테스트)
```
