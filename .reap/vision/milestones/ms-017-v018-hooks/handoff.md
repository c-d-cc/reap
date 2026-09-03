## milestone 종료 조건 대조표

| Exit Criteria | 근거 |
|---|---|
| `reap make hook --event <e> --name <n> [--type md\|sh] [--condition <c>] [--order <n>]`이 여섯 이벤트만 받고 `.reap/hooks/{event}.{name}.{ext}`를 놓는다 | `src/entries.ts`의 `makeHook`(gen-0076에서 구현) — `HOOK_EVENTS` 밖은 거부. `tests/hooks.test.ts` "make hook이 모르는 이벤트를 거부한다"·"make hook이 이벤트 여섯을 받아 ...를 놓는다" |
| `make generation`·`mark generation --closed`·`make milestone`·`mark milestone --closed`·`orch claim`(성공)·`orch barrier`(해제)가 발화하고, `.sh`의 stdout / `.md`의 본문이 명령 출력 뒤에 붙는다 | `src/entries.ts`(`makeMilestone`·`makeGeneration`·`markGeneration`·`markMilestone`)·`src/orch.ts`(`claim`·`waitBarrier`)가 `runHooks`를 파일 쓰기 뒤에 부른다. `src/cli.ts`의 `withHooks()`가 message 뒤에 `--- hooks ---`로 붙인다. `tests/hooks.test.ts`의 "여섯 지점 발화" 절(milestone.made·milestone.closed·gen.made·gen.closed) + `tests/orch.test.ts`의 "claim 성공이 orch.claimed를 발화한다"·"barrier 해제가 orch.barrier.released를 발화한다" |
| 훅이 실패해도 명령은 성공이다 — 테스트가 `exit 1` 훅으로 그것을 증명한다 | `tests/hooks.test.ts` "훅이 exit 1이어도 명령은 성공이고 실패 사유는 stderr에 담긴다" + "훅이 exit 1이어도 make generation이 세대 파일과 .session을 남긴다" |
| condition·order·타임아웃이 03-hooks대로 돈다. `doctor`가 규약 밖 파일명·모르는 이벤트·없는 조건 스크립트를 결함으로 낸다 | condition·order·타임아웃: `src/hooks.ts`(gen-0076) + `tests/hooks.test.ts`의 `listHooks`·`runHooks` 절. doctor: `src/doctor.ts`의 `checkHooks()` + `tests/doctor.test.ts` "hooks — 규약 밖 파일명·모르는 이벤트·없는 조건 스크립트를 결함으로 낸다"·"hooks — conditions/ 안의 파일과 규약에 맞는 훅은 결함이 아니다" |
| `init`이 `hooks/conditions/always.sh`를 씨앗으로 놓는다 (v0.17과 같이) | `src/cli.ts`의 `init()` — `SEEDS`(지식 씨앗 목록)에는 안 넣고 디렉토리 생성 시 실행 비트와 함께 놓는다. `tests/init.test.ts` "init이 hooks/conditions/always.sh를 실행 비트와 함께 놓지만 씨앗 목록에는 넣지 않는다"·"init --force가 이미 있는 always.sh를 건드리지 않는다" |
| spec 07-orchestrate의 "언제 만드는가 — 아직 아니다" 절이 결정(사람 2026-09-01)으로 갱신되고 `map.md` 씨앗(`src/templates/map.md`)의 hooks 줄이 실제와 맞는다 | `docs/superpowers/specs/reap/07-orchestrate.md`의 "제공한다 — 결정" 절. `src/templates/map.md`·`.reap/map.md`의 `hooks/` 줄(여섯 이벤트 이름·`conditions/`·`always.sh` 명시, 두 파일 diff 없음 유지) |
| `tests/hooks.test.ts`가 위를 덮고 전체 초록 | `bun test` 206 pass · 0 fail(2026-09-04). `bash tests/hook.test.sh` 전부 통과. `bun run typecheck` 통과 |

## 추가로 한 일 (milestone 밖이지만 이 milestone이 만든 결함 예방)

- `plugin/skills/migrate/scripts/detect-version.sh` — v0.18 init이 놓는 `hooks/conditions/always.sh` 때문에 기존 v0.17 표지("hooks/ 안의 파일")가 모든 v0.18 프로젝트를 `mixed`로 오판정하던 것을 고쳤다. 표지를 `hooks/` 바로 아래(conditions/ 제외)의 `*.sh`·`*.md` 중 v0.17 이벤트 관례(`^on[A-Z]`)로 시작하는 파일로 좁혔다. 6케이스 실측(v0.17 실물 복사·이 리포의 v0.18·빈·conditions만 있는 v0.18·v0.18 훅 파일이 있는 v0.18·혼재) 전부 기대한 판정이 나왔다 — 자세한 내용은 `gen-0079-exec-hooks-fire.md`의 Outcome
- `runHooks`에 `skipped: {file, reason}[]`를 추가했다(milestone.md의 "보완" 항목). 조건 스크립트가 있는데 거짓이면 skipped, 조건 스크립트 자체가 없으면 failures — doctor가 후자를 결함으로 잡는다

## 이 milestone이 끝나면 물어볼 것 (milestone.md에서)

아직 답하지 않음 — 사람이 판단할 일:

- 이 리포 자신이 훅을 하나라도 쓰고 싶어졌는가 (spec의 신호 1)
- 훅 출력이 명령 출력 뒤에 붙는 방식이 agent에게 읽혔는가, 묻혔는가
