# Validation Report

## Result

**pass**

모든 검증을 fresh 실행했다. implementation 결과를 재사용하지 않았다.

## Checks

### 빌드/타입

| 항목 | 명령 | 결과 |
|---|---|---|
| TypeCheck | `npm run typecheck` | **pass** (error 0) |
| Build | `npm run build` | **pass** |
| 문서 정합성 | `bash scripts/check-docs-version.sh` | **pass** — gen-073 이 만든 게이트가 계속 통과 |

### 테스트

| 스위트 | baseline (gen-073) | 현재 | 판정 |
|---|---|---|---|
| unit | 454 / 0 | **454 / 0** | pass |
| e2e | 263 / 1 | **263 / 1** | pass — 동일 pre-existing (`init-repair`) |
| scenario | 35 / **5** | **44 / 0** | **복구 완료** — 5건 해소 + 4건 신규 |

scenario 는 기존 40개 중 5 fail 이었고, 이제 44개 전건 통과다. 증가분 4는 gate 를 다루는 신규 case (`gated` / `--backlog 소비` / `consumed frontmatter` / `--no-backlog` 2건에서 기존 1건 대체분 상쇄).

### 완료 기준 (02-planning.md)

| # | 기준 | 결과 |
|---|---|---|
| 1 | scenario 40 pass / 0 fail | **초과 달성** — 44 pass / 0 fail |
| 2 | gate prompt 검증 | **pass** — `status: "prompt"`, `phase: "select-backlog"`, `pendingBacklog[0].filename`, 그리고 **generation 미생성**(`current.yml` 부재)까지 |
| 3 | `--backlog` 소비 + frontmatter 전환 | **pass** — `completed` 에 `backlog-consumed`, `sourceBacklog` 일치, `status: consumed` + `consumedBy: gen-002-*`, 본문 보존 |
| 4 | `--no-backlog` 경로 | **pass** — generation 생성되나 미소비, 항목은 `status: pending` 유지 |
| 5 | environment baseline 갱신 | reflect phase 에서 수행 |
| 6 | unit/e2e 회귀 없음 | **pass** |

## Edge Cases

- **gate 가 generation 을 만들지 않는지**: prompt 반환만 확인하면 "막힌 척하고 실제로는 생성"하는 경우를 놓친다. `current.yml` 부재까지 assert 했다
- **consumed 후 파일이 삭제되지 않는지**: 소비는 frontmatter 전환이지 삭제가 아니다. 파일 존재 + 본문(`# Carry-Over Test`) 보존을 확인
- **`--no-backlog` 가 항목을 건드리지 않는지**: `status: pending` 유지 + `consumedBy` 부재 양방향 확인. 이 플래그가 조용히 소비해버리면 다음 세대가 항목을 잃는다
- **직접 생성된 backlog 파일**: `carry-over-test.md` 는 `reap make backlog` 가 아닌 Write 로 만들어졌으나 `status: pending` 이 있어 gen-065 의 graceful 처리 범위에 든다. 실제로 정상 소비됨을 확인

## Issues

### e2e `init-repair` 1건 — pre-existing 유지

gen-072 부터 3세대 연속 동일 상태. 본 세대는 `tests/scenario/` 만 수정했으므로 무관하다.

**아직 backlog 화되지 않았다.** gen-072/073/074 에서 매번 "pre-existing" 으로 넘어가고 있으나, scenario 5건이 그랬듯 방치하면 계속 판단 비용을 치른다. 다음 세대 hints 에 포함한다.

## Notes

`config.evaluator: true` 이나 부모 에이전트가 직접 검증했다. advisor 모델이므로 허용된다.
