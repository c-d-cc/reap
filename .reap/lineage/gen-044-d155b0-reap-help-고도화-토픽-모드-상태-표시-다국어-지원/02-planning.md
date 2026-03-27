# Planning — gen-044-d155b0

## Goal
`reap help` 명령을 고도화하여 토픽 모드, 현재 generation 상태 표시, 다국어 지원을 추가한다.

## Completion Criteria
1. `reap help` 실행 시 다국어 slash command 테이블 + 현재 generation 상태 표시
2. `reap help <topic>` 실행 시 `status: "prompt"`로 AI에게 토픽 설명 위임 (reap-guide.md context 포함)
3. config language가 지원 언어(en/ko/ja/zh-CN)이면 해당 언어로 출력
4. 미지원 언어면 AI에게 번역 위임 (`status: "prompt"`)
5. `reap.help.md` skill에서 topic 인자를 전달 가능
6. 기존 테스트 유지 (411+ pass) + 신규 help 테스트 추가
7. `npm run build && npm test` 성공

## Approach
v0.15의 help.ts를 참조하되 v0.16 구조에 맞게 재작성:
- top-level command (`reap help [topic]`)로 유지 (v0.15는 `reap run help`)
- `createPaths(cwd)`로 config/current 읽기
- 프로젝트 `.reap/reap-guide.md`를 토픽 context로 사용
- `GenerationManager.current()`로 상태 읽기
- backlog에 명시된 대로 help 출력에 CLI commands 미포함 (slash commands만)

## Scope
변경 파일:
- `src/cli/commands/help.ts` — 전면 재작성
- `src/cli/index.ts` — help 명령에 `[topic]` 인자 추가
- `src/adapters/claude-code/skills/reap.help.md` — topic 인자 전달 지원
- `tests/unit/help.test.ts` — 신규 unit 테스트

Out of scope:
- reap-guide.md 내용 변경
- help 외 다른 명령의 다국어 지원

## Tasks
- [ ] T001 `src/cli/commands/help.ts` — 다국어 맵(REAP_INTRO, COMMAND_DESCRIPTIONS, TOPICS_LINE, CONFIG_LINE), 언어 감지, 상태 표시, 토픽 모드, 번역 위임 로직 구현
- [ ] T002 `src/cli/index.ts` — `help [topic]` 명령에 topic 인자 추가, execute에 전달
- [ ] T003 `src/adapters/claude-code/skills/reap.help.md` — topic 인자 전달 가능하도록 skill 업데이트
- [ ] T004 `tests/unit/help.test.ts` — help 관련 unit 테스트 (언어 감지, 명령 테이블 생성, 상태 표시 등 pure function 테스트)
- [ ] T005 빌드 + 전체 테스트 실행 (`npm run build && npm test`)

## Dependencies
T001 → T002 → T003 (순차), T004는 T001 이후 병행 가능, T005는 마지막
