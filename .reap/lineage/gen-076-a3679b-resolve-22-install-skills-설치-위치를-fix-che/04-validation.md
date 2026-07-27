# Validation Report

## Result

**pass**

모든 검증을 fresh 실행했다.

## Checks

### 빌드/타입/문서

| 항목 | 명령 | 결과 |
|---|---|---|
| TypeCheck | `npm run typecheck` | **pass** (error 0) |
| Build (CLI) | `npm run build` | **pass** |
| Build (docs) | `cd docs && npx vite build` | **pass** — 2.00s |
| 문서 정합성 | `bash scripts/check-docs-version.sh` | **pass** (v0.17.3) |

### 테스트

| 스위트 | baseline (gen-075) | 현재 | 판정 |
|---|---|---|---|
| unit | 461 / 0 | **470 / 0** | pass — 신규 9 (`integrity-user-level`) |
| e2e | 263 / 1 | **268 / 1** | pass — 신규 5, 동일 pre-existing (`init-repair`) |
| scenario | 44 / 0 | **44 / 0** | pass |

### issue #22 해소 실측

```
수정 전:  19 warnings "legacy reap command at user level (Phase 2 remnant)"
수정 후:  errors 0 | warnings 3
```

남은 3건은 본 이슈와 무관한 기존 항목이다:
- lineage parent "main" / "origin/main" not found (compressed epoch) ×2
- `genome/invariants.md` placeholder-only

**user-level 관련 경고는 0건.**

### 완료 기준 (02-planning.md)

| # | 기준 | 결과 |
|---|---|---|
| 1 | install-skills 후 user-level 경고 0 | **pass** — e2e 2 case 로 고정 (설치 직후 / 재설치 후) |
| 2 | 본 repo 19 → 0 | **pass** |
| 3 | 경로 단일 정의 | **pass** — `claudeCodeCommandsDir` 만 존재, checker 하드코딩 제거 |
| 4 | `core → adapters` 의존 없음 | **pass** — import 매치 0 (주석 언급만) |
| 5 | `~/.claude/skills/` error 유지 | **pass** — unit 2 case |
| 6 | project-level warning 유지 | **pass** — unit + e2e |
| 7 | `getAdapter` 실패 시 생존 | **pass** — try/catch → 빈 배열 |
| 8 | e2e HOME 격리 | **pass** — 아래 별도 확인 |
| 9 | 회귀 없음 | **pass** |
| 10 | 0.17.3 문서 정합 | **pass** |

### HOME 격리 실측 (기준 8)

이 테스트는 `install-skills` 를 실제로 실행하므로, 격리가 새면 **개발자의 실제 slash command 19개를 덮어쓴다.**

```
테스트 전:  ~/.claude/commands/reap.*.md  19개
테스트 후:  ~/.claude/commands/reap.*.md  19개  ← 불변
```

전체 스위트를 돌린 뒤에도 변화가 없다. child process 에 `HOME` 을 주입하는 방식이 실제로 작동함을 확인했다.

## Edge Cases

- **미주입(빈 배열)**: `~/.claude/commands/` 검사를 하지 않는다. 잘못된 기본값으로 오탐하느니 검사를 거르는 편이 낫다는 판단이며, `getAdapter("codex")` throw 경로가 실제로 여기 해당한다
- **canonical 로 승격**: `~/.claude/skills/` 를 canonicalDirs 에 넣으면 error 가 사라진다 — 미래에 adapter 가 그리로 옮겨도 `integrity.ts` 수정이 불필요함을 unit test 로 증명
- **`reapdev.` 접두사**: 검사 패턴이 `reap.` 이므로 걸리지 않는다. 본 repo 의 dev 명령이 보존됨을 e2e 로 확인
- **`~/.claude/agents/reap-*.md`**: hyphen 이라 `reap.` 패턴에 애초에 매칭되지 않는다. `userLevelDirs` 에 넣지 않고 주석으로 근거를 남겼다

## Issues

### 1. bun 의 `os.homedir()` 가 `$HOME` 을 무시한다 (구현 중 발견)

```
node: HOME 변경 → homedir() 즉시 반영
bun : HOME 변경 → homedir() 불변
```

gen-069 의 daemon e2e 가 HOME override 로 성공한 것은 child process 를 spawn 했기 때문이고, in-process 테스트에는 통하지 않는다.

대응: unit 은 `home` 인자 주입, e2e 는 child process env 주입. **부수적으로 설계가 나아졌다** — `home` 을 인자로 빼면서 `opencodeCommandsDir(home = homedir())` 와 시그니처 형태가 같아졌다.

longterm 기록 대상.

### 2. e2e `init-repair` 1건 — 6세대째 pre-existing

gen-072~076 연속. gen-074/075/076 validation 에서 각각 "3/4/5세대째"로 기록했고 이번이 6세대째다. gen-076(interview, abort됨) completion 에서 **"hints 는 backlog 가 아니다"** 를 longterm 에 남겼는데, 정작 이 항목은 여전히 hints 에만 있다.

**본 세대 completion 에서 backlog 로 만든다.** 6번 미룬 것을 7번째로 미루지 않는다.

## Notes

`config.evaluator: true` 이나 부모 에이전트가 직접 검증했다. advisor 모델이므로 허용된다.
