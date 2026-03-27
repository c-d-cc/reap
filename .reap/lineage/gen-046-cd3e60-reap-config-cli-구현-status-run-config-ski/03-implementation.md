# Implementation Log — gen-046-cd3e60

## Completed Tasks

### T001 `src/cli/commands/config.ts` — 신규
config.yml을 읽어서 ReapConfig 타입 기준으로 JSON 출력하는 execute() 구현. status.ts 패턴 참조 (createPaths, fileExists, detectV15, YAML.parse, emitOutput).

### T002 `src/cli/index.ts` — config 라우팅 추가
import + command("config") 등록. help 앞에 배치.

### T003 `reap.config.md` — skill 정비
disable-model-invocation 제거. AI가 `reap config` 호출 후 context 필드를 읽고 사용자에게 readable 형태로 표시하도록 안내. 설정 변경은 config.yml 직접 편집 안내.

### T004 `reap.status.md` — skill 정비
disable-model-invocation 제거. AI가 `reap status` JSON 결과를 해석해서 현재 generation 상태, 프로젝트 정보를 설명하도록 안내.

### T005 `reap.run.md` — skill 정비
disable-model-invocation 제거. 주요 사용 예시(start, learning, completion phases, back, abort) 추가. prompt 필드 follow 지시 포함.

### T006 `tests/e2e/cli-commands.test.ts` — config 테스트 추가
- config before init → error 반환 확인
- config after init → ok + context 필드 존재 확인

### T007 Build + Test
빌드 성공, 454 tests pass (272 unit + 141 e2e + 41 scenario). 기존 452 + 2 신규.

## Architecture Decisions
- config 명령을 `run` 하위가 아닌 top-level command로 구현 (v0.15에서는 `run config`였으나, v0.16에서는 status처럼 독립 명령으로 배치). reap-guide.md의 CLI Commands 섹션에도 이 패턴이 적합.
