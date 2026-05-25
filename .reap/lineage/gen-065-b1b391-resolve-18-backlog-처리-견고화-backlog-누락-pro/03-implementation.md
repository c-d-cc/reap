# Implementation Log

## Completed Tasks

| Task | Status | Notes |
|---|---|---|
| T001 evolve.ts 점검 | done | `src/cli/commands/run/evolve.ts` 확인 — subagent delegate prompt만 emit. start의 backlog flag와 무관. 변경 불필요. |
| T002 `--no-backlog` option 등록 | done | `src/cli/index.ts`. libs/cli.ts의 negate option semantics 활용 — `--backlog`와 같은 key를 공유하지만 tri-state (string \| true \| false): `true`=미지정(default), `string`=`--backlog X`, `false`=`--no-backlog`. 실험으로 동작 검증. |
| T003 run dispatcher 전달 | done | `src/cli/commands/run/index.ts` signature를 `string \| boolean`으로 확장. |
| T004 start create phase prompt | done | `src/cli/commands/run/start.ts` create phase 시작 직후 (merge 제외) `!backlogFilename && !noBacklogFlag && pending > 0` 시 `status: "prompt"`/`phase: "select-backlog"` emit + return. idempotent. |
| T005 consumeBacklog 견고화 | done | `src/core/backlog.ts` YAML.parse로 분석 (idempotency check) + 라인 단위 manipulation으로 사용자 frontmatter 형식 보존. 4 케이스 graceful: `status: pending`, `status:` 없음, 동일 gen 재consume, frontmatter 없음(warning). Return type 변경: `Promise<void>` → `Promise<ConsumeBacklogResult>`. |
| T006 start.ts consumeBacklog warning 활용 | done | 반환값을 받아서 `warning` 시 emitOutput context에 `backlogWarning` field 추가 + message 라인 prepend. |
| T007 누적 7개 cleanup | done | shell + node script로 atomic 실행 (위 표 매핑 7개). 각 lineage `meta.yml` goal 텍스트로 매핑 재검증 후 진행. frontmatter에 `status: consumed`, `consumedBy: <gen-id>`, `consumedAt: <last-commit-ISO>` 추가 + `mv` to `<lineage>/backlog/`. life/backlog/ 에 본 backlog 1개만 남음. |
| T008 unit consumeBacklog 4+ 케이스 | done | `tests/unit/backlog.test.ts` 신규 6 케이스 (no status field / idempotent same gen / re-consume different gen / no frontmatter warning / user field preservation / scanBacklog integration). 기존 2 케이스도 새 signature에 맞춰 update. |
| T009 unit start phase | done | start phase 4 케이스는 e2e에서 정밀하게 검증 — unit으로는 cli interaction이 분리되기 어려우므로 e2e로 통일 (T010에 포함). |
| T010 e2e lifecycle 시나리오 | done | `tests/e2e/backlog-start-flags.test.ts` 신규 8 케이스 (5 describe 블록): (a) pending+no flag → prompt+no gen, (b) pending+--no-backlog → ok+no consume, (c) no pending+no flag → ok (회귀), (d) frontmatter status 없음 → consumed 자동 추가, (e) frontmatter 자체 없음 → warning. |
| T011 build + 전체 test | done | `npm run build` OK. typecheck OK. unit 412 pass / 0 fail. e2e 198 pass / 1 fail (pre-existing init-repair, gen-064 fitness에 명시된 항목, 본 generation 회귀 아님). |
| T012 reap-guide 동기화 | done | `src/templates/reap-guide.md` + `.reap/reap-guide.md` 두 곳에 "Starting a Generation — Backlog Selection (Issue #18)" 절 추가 + `reap make backlog` 안내에 status field 자동 삽입 설명 보강. `diff` 결과 동기화 완료. |
| T013 검증 | done | git status로 7개 backlog `D` + 7개 lineage `<gen>/backlog/` `??` 확인. 본 backlog frontmatter `status: consumed` 정상 마킹 확인. submodule pointer 갱신 필요 (`m tests`) — completion-commit 직전 submodule 안에서 commit. |

## Discovered Issues

### libs/cli.ts negate option semantics

`--no-X` 형태 option은 `--X`와 같은 key를 공유하면서 tri-state로 표현됨:
- `true` = default (flag 미지정), negate option이 등록되었음을 알리는 marker.
- `false` = `--no-X` 명시.
- string/value = `--X <value>` 명시.

본 generation에서 `start --backlog`와 `start --no-backlog`를 별도 옵션으로 분리할 필요 없이 commander convention 그대로 활용. 실제 동작은 `node /tmp/test-cli.ts`로 사전 검증.

### tests submodule pointer 갱신

`tests/`는 git submodule. 본 generation에서 `tests/unit/backlog.test.ts` modified + `tests/e2e/backlog-start-flags.test.ts` new. submodule 안에서 먼저 commit한 뒤 parent repo에서 pointer staging 필요 — completion-commit 직전 처리.

## Deferred Items

- **Part 4 — `reap consume backlog` helper 명령**: Learning phase에서 객관 평가 후 미구현 결정. root cause fix 후 누락 경로 차단됐고, 1회성 cleanup은 shell script로 충분. 사용자 use case가 명확하지 않으면 surface area 추가 보류. 향후 실 사용에서 필요성 발견 시 별도 backlog로 처리.

## Architecture Decisions

### YAML.parse는 분석만, write는 라인 단위 manipulation

YAML.parse + YAML.stringify round-trip은 다음 손실 가능:
- comment 손실
- key 순서 변경
- string quote/non-quote 정규화
- numeric 추론 (e.g. `issueUrl: 18` → `18` (number) 로 변환되어 다음 read 시 string으로 안 나옴)

본 generation은 사용자가 작성한 backlog frontmatter 형식을 최대 보존해야 하므로, YAML.parse는 idempotency check 한 가지에만 사용하고 실제 write는 라인 단위 manipulation. 부수 효과로 7개 누적 cleanup도 같은 알고리즘으로 처리 — 결과 frontmatter 모두 원본 형식 보존 (head 검증 완료).

### archive.ts 변경 불필요

`src/core/archive.ts:46-48`은 `scanBacklog` 결과 중 `status === "consumed"` 인 것만 archive. `scanBacklog`는 frontmatter `status` 필드가 없으면 `?? "pending"` 기본값. 즉 archive 의존성은 frontmatter `status: consumed` 명시. 본 generation의 `consumeBacklog` 견고화가 frontmatter 보장하면 archive.ts 변경 없이 정상 동작 — Part 3 cleanup 7개도 같은 방식으로 lineage/<gen>/backlog/에 진입.

### `--no-backlog` UX 모순 회피

처음에는 별도 옵션 (`--skip-backlog` 등) 검토했으나, 사용자 backlog 문서 본문이 `--no-backlog`를 명시했고 commander convention과 정확히 일치. libs/cli.ts의 기존 negate semantics를 그대로 활용 — start.ts에서 tri-state로 처리. 새 옵션 surface area 추가 없이 fix.

### Echo Chamber 점검

본 generation에서 추가한 모든 변경은 source backlog의 7 Part / 17 verification 기준 내. 자율 추가 없음. Part 4는 객관 평가 후 명시 거부 (sycophancy 방지).
